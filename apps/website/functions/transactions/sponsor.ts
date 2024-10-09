import { Address, HDKey, Transaction, Secp256k1, Hex } from '@vechain/sdk-core';

export async function onRequestPost({ request, env }): Promise<Response> {
    const body = await request.json()
    console.log('Incoming request', body);

    const signerWallet = HDKey.fromMnemonic((env.SIGNER_MNEMONIC).split(' '), HDKey.VET_DERIVATION_PATH).deriveChild(0);
    if (!signerWallet.publicKey || !signerWallet.privateKey) { throw new Error('Could not load signing wallet') }

    const signerAddress = Address.ofPublicKey(signerWallet.publicKey)
    const transactionToSign = Transaction.decode(
        Buffer.from(body.raw.slice(2), 'hex'),
        false
    );
    const transactionHash = transactionToSign.getSignatureHash(Address.of(body.origin))
    const signature = Secp256k1.sign(transactionHash.bytes, signerWallet.privateKey)

    return new Response(JSON.stringify({
        signature: Hex.of(signature).toString(),
        address: signerAddress.toString()
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'access-control-allow-origin': '*'
        }
    })
}