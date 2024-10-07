import { useMemo } from 'react'
import { useConnex, useWalletModal, useWallet } from "@vechain/dapp-kit-react"
import { Provider } from '@vechain/web3-providers-connex'
import { createConfig, custom } from 'wagmi'
import { createConnector } from '@wagmi/core'
import { DELEGATION_URL, NETWORK } from '~/config'
import { mainnet, testnet, solo } from './configs/vechain'


const VechainNetworkMap: Record<string, any> = {
    'main': mainnet,
    'test': testnet,
    'solo': solo
}
const vechainNetwork = VechainNetworkMap[NETWORK] ?? mainnet

export function useWagmiConfig() {
    const connex = useConnex()
    const connectModal = useWalletModal()
    const { connect, account, disconnect } = useWallet()

    const config = useMemo(() => {
        // create the provider
        const connexProvider = new Provider(
            DELEGATION_URL
                ? { connex, delegate: { url: DELEGATION_URL } }
                : { connex }
        )
        const provider = custom(connexProvider)

        // build a new connector for vechain
        const connector = createConnector(() => ({
            id: vechainNetwork.id,
            name: vechainNetwork.name,
            type: 'wallet',
            connect: async () => {
                console.log("account", account)
                if (!account) {
                    await connectModal.open()
                    const result = await connect()
                    return {
                        accounts: [result.account as `0x${string}`],
                        chainId: vechainNetwork.id,
                    }
                }

                return {
                    accounts: [account as `0x${string}`],
                    chainId: vechainNetwork.id
                }
            },
            disconnect: async () => await disconnect(),
            getProvider: async () => {
                return {
                    ...provider,
                    request: connexProvider.request.bind(connexProvider)
                }
            },
            getChainId: async () => vechainNetwork.id,
            getAccounts: async () => account ? [account as `0x${string}`] : [],
            isAuthorized: async () => Boolean(account),
            onAccountsChanged: () => { },
            onChainChanged: () => { },
            onDisconnect: () => { },
            setup: async () => { },
        }))

        // combine it into a valid configuration
        return createConfig({
            chains: [vechainNetwork],
            connectors: [connector],
            transports: {
                [vechainNetwork.id]: provider
            }
        })
    }, [connex, account, connect, disconnect, connectModal]);

    return {
        config
    }
}