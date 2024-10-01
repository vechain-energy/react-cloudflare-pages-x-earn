export * from '~/../../../dist/config.ts'

// obtain on https://cloud.walletconnect.com/
// must be set to enable VeWorld mobile connections on Desktop
export const WALLET_CONNECT_PROJECT_ID = process.env.WALLET_CONNECT_PROJECT_ID ?? "";

// the network to use, based on the node to connect to
export const NODE_URL = process.env.NODE_URL ?? `https://testnet.vechain.org`;
export const NETWORK = process.env.NETWORK ?? "test";

export const SOLO_BLOCK = {
    "number": 0,
    "id": "0x00000000c05a20fbca2bf6ae3affba6af4a74b800b585bf7a4988aba7aea69f6",
    "size": 170,
    "parentID": "0xffffffff00000000000000000000000000000000000000000000000000000000",
    "timestamp": 1526400000,
    "gasLimit": 10000000,
    "beneficiary": "0x0000000000000000000000000000000000000000",
    "gasUsed": 0,
    "totalScore": 0,
    "txsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
    "txsFeatures": 0,
    "stateRoot": "0x93de0ffb1f33bc0af053abc2a87c4af44594f5dcb1cb879dd823686a15d68550",
    "receiptsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
    "com": false,
    "signer": "0x0000000000000000000000000000000000000000",
    "isTrunk": true,
    "isFinalized": true,
    "transactions": []
}

// if fee delegation will be used, the url to the delegation service
export const DELEGATION_URL = process.env.DELEGATION_URL

// app meta data, mainly used for wallet connect and html metadata
export const APP_TITLE = process.env.APP_TITLE ?? "Vechain dApp";
export const APP_DESCRIPTION = process.env.APP_DESCRIPTION ?? "This is an example dApp showcasing basic interaction with VeChain.";
export const APP_ICONS = (process.env.APP_ICONS ?? "").split(',');

// backend url, should by / in default deployment, but could be different (in development for example)
export const BACKEND_URL = process.env.BACKEND_URL ?? '/'