import { Fragment } from 'react';
import { BACKEND_URL } from '~/config';
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'

const WebProviders = [
    {
        id: 'withings',
        title: 'withings',
    }
]

export function ConnectWebApp() {
    const { isConnected, address } = useAccount()

    const { data: connectedServices = [] } = useQuery({
        queryKey: ['connectedServices', address],
        queryFn: () => 
            fetch(`${BACKEND_URL}/connect/status/${address}`)
                .then(response => response.json()),
        enabled: !!address,
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
                                <span>Connected</span>
                            ) : (
                                <a href={`${BACKEND_URL}/connect/oauth/${provider.id}?user_id=${encodeURIComponent(String(address))}&redirect_uri=${encodeURIComponent(window.location.href)}`}>Connect</a>
                            )}
                        </dd>
                    </Fragment>
                ))}
            </dl>

        </div>
    )
}