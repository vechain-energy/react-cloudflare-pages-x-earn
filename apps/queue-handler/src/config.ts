import * as TestNetwork from '../../../dist/test/config.ts'
import * as MainNetwork from '../../../dist/main/config.ts'
import * as SoloNetwork from '../../../dist/solo/config.ts'

export const Networks = {
    test: TestNetwork,
    main: MainNetwork,
    solo: SoloNetwork
}

export default function getConfig(env: Env) {
    const NODE_URL = env.NODE_URL ?? `http://localhost:8669`;
    const NETWORK: keyof typeof Networks = env.NETWORK as keyof typeof Networks ?? "solo"

    const Addresses = Networks[NETWORK].Addresses
    const ABI = Networks[NETWORK].ABI
    const CONTRACTS_NODE_URL = Networks[NETWORK].CONTRACTS_NODE_URL

    return {
        NODE_URL,
        NETWORK,
        Addresses,
        ABI,
        CONTRACTS_NODE_URL
    }
}