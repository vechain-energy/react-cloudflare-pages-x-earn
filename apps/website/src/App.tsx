import { NODE_URL, NETWORK, APP_TITLE, DELEGATION_URL, SOLO_BLOCK, PRIVY_APP_ID, Addresses } from '~/config';
import { useWallet } from '@vechain/dapp-kit-react'; // Ensure Genesis is imported
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWagmiConfig } from './hooks/useWagmiConfig';
import { useAccount, useConnect, useDisconnect, WagmiProvider } from 'wagmi'
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import { Homepage } from './Homepage';
import { Profile } from './Profile';
import { useEffect } from 'react';
import { ClaimReward } from './ClaimReward';
import { ConnectWebApp } from './ConnectWebApp'
import { VeChainSmartAccountProvider } from '~/modules/smart-accounts';

type Genesis = 'main' | 'test' | Connex.Thor.Block;

// query client for react-query
const queryClient = new QueryClient()

export default function App() {
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{APP_TITLE}</title>
            </Helmet>

            <Providers>
                <Layout>
                    <Routes>
                        <Route path="/me" element={<Profile />} />
                        <Route path="/claim" element={<ClaimReward />} />
                        <Route path="/connect" element={<ConnectWebApp />} />
                        <Route path="*" element={<Homepage />} />
                    </Routes>
                </Layout>
            </Providers>
        </>
    )
}

function Providers({ children }: { children: React.ReactNode }) {
    const genesis = ['main', 'test'].includes(NETWORK) ? NETWORK as Genesis
        : NETWORK === 'solo' ? SOLO_BLOCK as Genesis
            : undefined;

    return (
        <VeChainSmartAccountProvider
            nodeUrl={NODE_URL}

            // TODO: This should be a list: smartAccountFactories={["0x.."]}
            accountFactory={Addresses.SimpleAccountFactory}

            delegatorUrl={DELEGATION_URL}

            loginProviders={[
                {
                    provider: "privy",
                    config: {
                        appId: PRIVY_APP_ID,
                        config: {
                            embeddedWallets: {
                                createOnLogin: 'users-without-wallets'
                            }
                        }
                    }
                }
            ]}
        >

            <DAppKitConsumers>{children}</DAppKitConsumers>
        </VeChainSmartAccountProvider>
    );
}

function DAppKitConsumers({ children }: { children: React.ReactNode }) {
    const { config } = useWagmiConfig()

    return (
        <Router>
            <WagmiProvider config={config} reconnectOnMount={false}>
                <QueryClientProvider client={queryClient}>
                    <WagmiAutoConnector>
                        {children}
                    </WagmiAutoConnector>
                </QueryClientProvider>
            </WagmiProvider>
        </Router>
    );
}

function WagmiAutoConnector({ children }: { children: React.ReactNode }) {
    const { account } = useWallet()
    const { isConnected } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
    const { config } = useWagmiConfig()

    useEffect(() => {
        if (!isConnected && account) {
            connect({ connector: config.connectors[0] })
        }
    }, [isConnected, account, connect])

    useEffect(() => {
        if (isConnected && !account) {
            disconnect({ connector: config.connectors[0] })
        }
    }, [isConnected, account, disconnect])

    return children
}