import {
    ProviderInternalHDWallet,
} from '@vechain/sdk-network';
import {
    secp256k1,
    TransactionHandler,
} from '@vechain/sdk-core';

export async function onRequestPost({ request, env }): Promise<Response> {
    const body = await request.json()
    console.log('Incoming request', body);

    const transactionToSign = TransactionHandler.decode(
        Buffer.from(body.raw.slice(2), 'hex')
    );
    console.log('Transaction', transactionToSign);

    const signerWallet = new ProviderInternalHDWallet((env.SIGNER_MNEMONIC).split(' '))
    const signer = await signerWallet.getAccount(0)

    const delegatedHash = transactionToSign.getSignatureHash(body.origin);
    const signature = `0x${Buffer.from(
        secp256k1.sign(delegatedHash, signer.privateKey)
    ).toString('hex')}`;

    console.log('Signature', signature);

    return new Response(JSON.stringify({
        signature,
        address: signer?.address
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'access-control-allow-origin': '*'
        }
    })
}