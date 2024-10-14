import { Fragment } from 'react';
import { BACKEND_URL } from '~/config';
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'

const WebProviders = [
    {
        id: 'withings',
        title: 'withings',
    }
]

export function ConnectWebApp() {
    const { isConnected, } = useAccount()

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
                            <Link to={`${BACKEND_URL}/connect/oauth/${provider.id}`}>Connect</Link>
                        </dd>
                    </Fragment>
                ))}
            </dl>

        </div>
    )
}