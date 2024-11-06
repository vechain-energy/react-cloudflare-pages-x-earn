import React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { LoginProviders } from './LoginProviders'

export interface LoginProvidersProps {
    children: React.ReactNode | React.ReactNode[] | string
    nodeUrl: string
    delegatorUrl: string
    accountFactory: string
    loginProviders: [
        {
            provider: "privy" | "vechain",
            config: Omit<React.ComponentProps<typeof PrivyProvider>, 'children'> & {
                config: React.ComponentProps<typeof PrivyProvider>['config'] & {
                    embeddedWallets: {
                        createOnLogin: 'users-without-wallets' | 'all-users' // off is not allowed, because we need a user
                    }
                }
            }
        }
    ]
}

export type VeChainAccountProviderProps = Omit<LoginProvidersProps, 'loginProviders'> & {
    address: string | undefined;
    embeddedWallet: ConnectedWallet | undefined;
    sendTransaction: (tx: { to?: string; value?: string | number | bigint; data?: string | { abi: Abi[] | readonly unknown[]; functionName: string; args: any[] } }) => Promise<string>;
    exportWallet: () => Promise<void>;
}