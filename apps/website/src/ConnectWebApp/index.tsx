import { Fragment } from 'react';
import { BACKEND_URL } from '~/config';
import { useAccount } from 'wagmi'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSession } from '~/hooks/useSession'

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
                                <a href={`${BACKEND_URL}/rewards/connections/${provider.id}/${session.data?.address}`} target="_blank" rel="noopener noreferrer">Connected: Test Claim</a>
                            ) : (
                                <button onClick={() => connectMutation.mutate(provider.id)}>Connect</button>
                            )}
                        </dd>
                    </Fragment>
                ))}
            </dl>

        </div>
    )
}