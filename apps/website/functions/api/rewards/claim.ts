import {
    Contract,
    ThorClient,
    VeChainProvider,
    ProviderInternalBaseWallet,
    ProviderInternalHDWallet,
} from '@vechain/sdk-network';
import getConfig from '../../config';

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
const DEFAULT_MNEMONIC = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross'
const DEFAULT_REWARDER_MNEMONIC_CHILD = 3

export async function onRequestPost({ request, env }): Promise<Response> {
    const { Addresses, ABI, CONTRACTS_NODE_URL } = getConfig(env)

    try {
        const body = await request.json()
        console.log('Incoming request', body);

        const { receiver } = body

        const mnemonic = (env.MNEMONIC ?? DEFAULT_MNEMONIC).split(' ')
        const mnemonicIndex = Number(env.REWARDER_MNEMONIC_CHILD ?? DEFAULT_REWARDER_MNEMONIC_CHILD)
        const nodeUrl = env.NODE_URL ?? CONTRACTS_NODE_URL

        const thor = ThorClient.fromUrl(nodeUrl)
        const signerWallet = new ProviderInternalHDWallet(mnemonic, mnemonicIndex + 1)
        const signerAccount = await signerWallet.getAccount(mnemonicIndex)
        const provider = new VeChainProvider(
            thor,
            new ProviderInternalBaseWallet([signerAccount]),
        );
        const signer = await provider.getSigner(signerAccount.address);

        const x2App = new Contract(Addresses.X2EarnApp, ABI, thor, signer)
        const result = await x2App.transact.rewardTo(receiver)

        return new Response(JSON.stringify({
            nodeUrl,
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