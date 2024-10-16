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
        title: 'Withings',
    }
]

export function ConnectWebApp() {
    const { isConnected, address } = useAccount()
    const session = useSession()

    const { data: connectedServices = [], refetch: refetchConnectedServices } = useQuery({
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
        mutationFn: (serviceId: string) =>
            fetch(`${BACKEND_URL}/connect/oauth/${serviceId}`, {
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
        mutationFn: (serviceId: string) =>
            fetch(`${BACKEND_URL}/rewards/connections/${serviceId}/${session.data?.address}`, {
                method: 'POST'
            })
                .then(response => response.json()),
    })

    const disconnectMutation = useMutation({
        mutationFn: (serviceId: string) =>
            fetch(`${BACKEND_URL}/connect/${serviceId}/close`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.data?.sessionId}`,
                },
            })
                .then(response => response.json()),
        onSuccess: () => {
            refetchConnectedServices()
        },
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
                        <dd className='font-mono text-xs'>
                            {connectedServices.includes(provider.id) ? (
                                'Connected'
                            ) : (
                                <button onClick={() => connectMutation.mutate(provider.id)}>Connect</button>
                            )}
                        </dd>
                        <dd className='font-mono text-xs text-right'>
                            {connectedServices.includes(provider.id) && (
                                <>
                                    <button
                                        onClick={() => claimMutation.mutate(provider.id)}
                                        disabled={claimMutation.isPending}
                                        className="mr-2"
                                    >
                                        {claimMutation.isPending ? 'Claiming...' : 'Test Claim'}
                                    </button>
                                    <button
                                        onClick={() => disconnectMutation.mutate(provider.id)}
                                        disabled={disconnectMutation.isPending}
                                    >
                                        {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                                    </button>
                                </>
                            )}
                        </dd>
                    </Fragment>
                ))}
            </dl>

            {claimMutation.isError && <ErrorMessage>{claimMutation.error.message}</ErrorMessage>}
            {disconnectMutation.isError && <ErrorMessage>{disconnectMutation.error.message}</ErrorMessage>}
            {claimMutation.data?.reward?.txId && <Transaction txId={claimMutation.data.reward.txId} />}
        </div>
    )
}