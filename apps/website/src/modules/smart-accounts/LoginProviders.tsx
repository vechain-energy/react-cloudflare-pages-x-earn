import { NODE_URL, NETWORK, WALLET_CONNECT_PROJECT_ID, APP_TITLE, APP_DESCRIPTION, APP_ICONS, SOLO_BLOCK } from '~/config';
import { PrivyProvider } from '@privy-io/react-auth'
import type { LoginProvidersProps } from './types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VeChainAccountProvider } from './useVeChainAccount';
import { DAppKitProvider } from '@vechain/dapp-kit-react'
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

export const LoginProviders = ({ loginProviders, children, ...props }: LoginProvidersProps) => {
    const genesis = ['main', 'test'].includes(NETWORK) ? NETWORK as Genesis
        : NETWORK === 'solo' ? SOLO_BLOCK as Genesis
            : undefined;

    let wrappedChildren = (
        <DAppKitProvider
            nodeUrl={NODE_URL}
            genesis={genesis}
            usePersistence
            walletConnectOptions={walletConnectOptions}
            requireCertificate
        >
            <QueryClientProvider client={queryClient}>
                <VeChainAccountProvider {...props}>
                    {children}
                </VeChainAccountProvider>
            </QueryClientProvider>
        </DAppKitProvider>
    )

    loginProviders.forEach(provider => {
        if (provider.provider === "privy") {
            wrappedChildren = (
                <PrivyProvider {...provider.config}>
                    {wrappedChildren}
                </PrivyProvider>
            );
        }
    });

    return wrappedChildren
}
