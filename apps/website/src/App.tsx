import { DAppKitProvider } from '@vechain/dapp-kit-react'; // Ensure Genesis is imported
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NODE_URL, NETWORK, WALLET_CONNECT_PROJECT_ID, APP_TITLE, APP_DESCRIPTION, APP_ICONS, SOLO_BLOCK } from '~/config';
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Homepage from './Homepage';

type Genesis = 'main' | 'test' | Connex.Thor.Block;

// define wallet connect options only in case a project id has been provided
const walletConnectOptions = !WALLET_CONNECT_PROJECT_ID ? undefined : {
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: APP_TITLE,
        description: APP_DESCRIPTION,
        url: window.location.origin,
        icons: APP_ICONS
    },
};

// query client for react-query
const queryClient = new QueryClient()

export default function App() {
    return (
        <Providers>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{APP_TITLE}</title>
            </Helmet>

            <Router>
                <Layout>
                    <Routes>
                        <Route path="*" element={<Homepage />} />
                    </Routes>
                </Layout>
            </Router>
        </Providers>
    )
}

function Providers({ children }: { children: React.ReactNode }) {
    const genesis = ['main', 'test'].includes(NETWORK) ? NETWORK as Genesis
        : NETWORK === 'solo' ? SOLO_BLOCK as Genesis
        : undefined;

    return (
        <QueryClientProvider client={queryClient}>
            <DAppKitProvider
                nodeUrl={NODE_URL}
                genesis={genesis}
                usePersistence={true}
                walletConnectOptions={walletConnectOptions}
            >
                {children}
            </DAppKitProvider>
        </QueryClientProvider>
    );
}