import { Fragment } from 'react';
import { BACKEND_URL } from '~/config';
import { useAccount } from 'wagmi'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSession } from '~/hooks/useSession'
import Transaction from '~/common/Transaction';
import ErrorMessage from '~/common/ErrorMessage';

const WebProviders = [
    {
        id: 'withings',
        title: 'withings',
    }
]

export function ConnectWebApp() {
    const { isConnected, address } = useAccount()
    const session = useSession()

    const { data: connectedServices = [] } = useQuery({
        queryKey: ['connectedServices', address],
        queryFn: () =>
            fetch(`${BACKEND_URL}/connect/status`, {
                headers: {
                    'Authorization': `Bearer ${session.data?.sessionId}`
                }
            })
                .then(response => response.json()),
        enabled: Boolean(session.data?.sessionId),
    })

    const connectMutation = useMutation({
        mutationFn: (providerId: string) =>
            fetch(`${BACKEND_URL}/connect/oauth/${providerId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.data?.sessionId}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    redirect_uri: window.location.href,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    window.location.href = data.redirectUrl
                }),
    })

    const claimMutation = useMutation({
        mutationFn: (providerId: string) =>
            fetch(`${BACKEND_URL}/rewards/connections/${providerId}/${session.data?.address}`, {
                method: 'POST'
            })
                .then(response => response.json()),
    })

    if (!isConnected) {
        return <p>Please connect your wallet to view your profile.</p>
    }

    return (
        <div className='space-y-4 max-w-lg w-full'>
            <div className='text-xl font-semibold'>Connected Applications</div>

            <dl className="grid grid-cols-2 gap-y-4">
                {WebProviders.map(provider => (
                    <Fragment key={provider.id}>
                        <dt className="font-medium text-sm">{provider.title}:</dt>
                        <dd className='font-mono text-xs text-right'>
                            {connectedServices.includes(provider.id) ? (
                                <button 
                                    onClick={() => claimMutation.mutate(provider.id)}
                                    disabled={claimMutation.isPending}
                                >
                                    Connected: {claimMutation.isPending ? 'Claiming...' : 'Test Claim'}
                                </button>
                            ) : (
                                <button onClick={() => connectMutation.mutate(provider.id)}>Connect</button>
                            )}
                        </dd>
                    </Fragment>
                ))}
            </dl>


            {claimMutation.isError && <ErrorMessage>{claimMutation.error.message}</ErrorMessage>}
            {claimMutation.data?.reward?.txId && <Transaction txId={claimMutation.data.reward.txId} />}
        </div>
    )
}