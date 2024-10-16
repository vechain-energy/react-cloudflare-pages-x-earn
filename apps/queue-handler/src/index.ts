import { ThorClient, VeChainProvider, ProviderInternalBaseWallet, ProviderInternalHDWallet, Contract } from '@vechain/sdk-network';
import { Units } from '@vechain/sdk-core'
import getConfig from './config';

const DEFAULT_MNEMONIC = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross';
const DEFAULT_REWARDER_MNEMONIC_CHILD = 3;

export default {
	// Our fetch handler is invoked on a HTTP request: we can send a message to a queue
	// during (or after) a request.
	// https://developers.cloudflare.com/queues/platform/javascript-apis/#producer
	async fetch(req, env): Promise<Response> {
		// To send a message on a queue, we need to create the queue first
		// https://developers.cloudflare.com/queues/get-started/#3-create-a-queue
		await env.CLAIMS.send(await req.json());
		return new Response('Sent message to the queue');
	},

	// The queue handler is invoked when a batch of messages is ready to be delivered
	// https://developers.cloudflare.com/queues/platform/javascript-apis/#messagebatch
	async queue(batch, env): Promise<void> {

		console.log('queue', 'received', batch.messages.length, 'messages')
		for (const message of batch.messages) {
			const { method, params } = message.body

			if (method === 'handleUser') {
				const [userId] = params

				const services = await loadServices(env, userId)
				for (const service of services) {
					if (service.service_id === 'withings') {
						const rewards = await handleRewardForWithings(userId, service, env);
						if(rewards > 0) {

						}
					}
				}

			}
		}
	},
} satisfies ExportedHandler<Env, QueueTask, Error>;


async function loadServices(env: Env, userId: string): Promise<OAuthSession[]> {
	console.log(`Loading services for user ${userId}`);
	// Query the database to get connected services for the user
	const { results } = await env.DB.prepare(
		"SELECT * FROM oauth_sessions WHERE user_id = ?"
	).bind(userId).all<OAuthSession>();

	const updatedSessions: OAuthSession[] = [];

	for (const session of results) {
		let updatedSession = { ...session };

		// Check if token is expired and needs refreshing
		if (new Date(Number(session.expires_at)) <= new Date()) {
			console.log(`Refreshing token for ${session.service_id}`);

			// Implement token refresh logic here
			const refreshedToken = await refreshToken(session, env);

			if (refreshedToken) {
				updatedSession.access_token = refreshedToken.access_token;
				updatedSession.expires_at = new Date(refreshedToken.expires_at);

				// Update the database with the new token
				await env.DB.prepare(
					"UPDATE oauth_sessions SET access_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND service_id = ?"
				).bind(refreshedToken.access_token, refreshedToken.expires_at, userId, session.service_id).run();
			} else {
				console.error(`Failed to refresh token for ${session.service_id}`);
				continue; // Skip this service if token refresh failed
			}
		}

		updatedSessions.push(updatedSession);
	}

	console.log(`Loaded ${updatedSessions.length} services for user ${userId}`);
	return updatedSessions;
}

async function refreshToken(service: OAuthSession, env: Env): Promise<{ access_token: string, expires_at: number } | null> {
	if (service.service_id === 'withings' && env.WITHINGS_CLIENT_ID && env.WITHINGS_CLIENT_SECRET) {
		try {
			const response = await fetch('https://wbsapi.withings.net/v2/oauth2', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'requesttoken',
					client_id: env.WITHINGS_CLIENT_ID,
					client_secret: env.WITHINGS_CLIENT_SECRET,
					grant_type: 'refresh_token',
					refresh_token: service.refresh_token,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.status !== 0) {
				throw new Error(`Withings API error: ${data.status}`);
			}

			return {
				access_token: data.body.access_token,
				expires_at: Date.now() + (data.body.expires_in * 1000),
			};
		} catch (error) {
			console.error('Error refreshing Withings token:', error);
			return null;
		}
	}

	// Add cases for other services here if needed

	console.error(`Unsupported service for token refresh: ${service.service_id}`);
	return null;
}

async function handleRewardForWithings(userId: string, service: OAuthSession, env: Env): Promise<number> {
	const today = new Date();
	const startOfYear = new Date(today.getFullYear(), 0, 1);

	const startDate = startOfYear.toISOString().split('T')[0];
	const endDate = today.toISOString().split('T')[0];

	try {
		const activityResponse = await fetch('https://wbsapi.withings.net/v2/measure', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': `Bearer ${service.access_token}`
			},
			body: new URLSearchParams({
				action: 'getactivity',
				startdateymd: startDate,
				enddateymd: endDate
			})
		});

		const activityData = await activityResponse.json();

		if (activityData.status !== 0) {
			console.error('Failed to fetch activity data:', activityData);
			throw new Error('Failed to fetch activity data');
		}

		let totalSteps = 0;
		if (activityData.body && activityData.body.activities) {
			totalSteps = activityData.body.activities.reduce((sum, activity) => sum + (activity.steps || 0), 0);
		}

		console.log(`User ${userId} has taken ${totalSteps} steps this year.`);

		// Here you can implement your reward logic based on totalSteps
		// For now, we'll just return the total steps as the reward
		return totalSteps;

	} catch (error) {
		console.error(`Error handling reward for Withings user ${userId}:`, error);
		throw error;
	}
}


async function sendReward(amount: number, receiver: string, env: Env) {
    const { Addresses, ABI, CONTRACTS_NODE_URL } = getConfig(env);

    try {
        const mnemonic = (env.MNEMONIC ?? DEFAULT_MNEMONIC).split(' ');
        const mnemonicIndex = Number(env.REWARDER_MNEMONIC_CHILD ?? DEFAULT_REWARDER_MNEMONIC_CHILD);
        const nodeUrl = env.NODE_URL ?? CONTRACTS_NODE_URL;

        const thor = ThorClient.fromUrl(nodeUrl);
        const signerWallet = new ProviderInternalHDWallet(mnemonic, mnemonicIndex + 1);
        const signerAccount = await signerWallet.getAccount(mnemonicIndex);
        const provider = new VeChainProvider(
            thor,
            new ProviderInternalBaseWallet([signerAccount]),
        );
        const signer = await provider.getSigner(signerAccount.address);

        const x2App = new Contract(Addresses.X2EarnApp, ABI, thor, signer);
        const result = await x2App.transact.rewardAmountTo(Units.parseUnits(String(amount), 18), receiver);

        return {
            nodeUrl,
            rewarderAddress: signerAccount?.address,
            txId: result.id
        };
    } catch (error) {
        console.error('Error in sendReward:', error);
        throw error;
    }
}
