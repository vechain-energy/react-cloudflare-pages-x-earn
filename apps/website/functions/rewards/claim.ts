import {
    Contract,
    ThorClient,
    VeChainProvider,
    ProviderInternalBaseWallet,
    ProviderInternalHDWallet,
} from '@vechain/sdk-network';
import { Addresses, ABI, CONTRACTS_NODE_URL } from '../../src/config'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestOptions(): Promise<Response> {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    });
}

// the default signer is a solo node seeded account
const DEFAULT_SIGNER = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross'

export async function onRequestPost({ request, env }): Promise<Response> {
    try {
        const body = await request.json()
        console.log('Incoming request', body);

        const { receiver } = body

        const thor = ThorClient.fromUrl(CONTRACTS_NODE_URL)
        const signerWallet = new ProviderInternalHDWallet((env.MNEMONIC ?? DEFAULT_SIGNER).split(' '), Number(env.REWARDER_MNEMONIC_CHILD) + 1)
        const signerAccount = await signerWallet.getAccount(Number(env.REWARDER_MNEMONIC_CHILD ?? 0))
        const provider = new VeChainProvider(
            thor,
            new ProviderInternalBaseWallet([signerAccount]),
        );
        const signer = await provider.getSigner(signerAccount.address);

        const x2App = new Contract(Addresses.X2EarnApp, ABI, thor, signer)
        const result = await x2App.transact.rewardTo(receiver)

        return new Response(JSON.stringify({
            nodeUrl: CONTRACTS_NODE_URL,
            rewarderAddress: signerAccount?.address,
            txId: result.id
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}