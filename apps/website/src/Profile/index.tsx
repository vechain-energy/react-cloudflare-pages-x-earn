import { NETWORK } from '~/config';
import { useAccount, useEnsName, useReadContracts } from 'wagmi'
import { Addresses, ABI } from '~/config'
import { B3TRBalance } from '~/common/B3TRBalance'

export function Profile() {
    const { isConnected, address, } = useAccount()
    const ens = useEnsName({ address })

    const balance = useReadContracts({
        contracts: [
            {
                abi: ABI,
                address: Addresses.B3TR as `0x${string}`,
                functionName: 'balanceOf',
                args: [address]
            },
            {
                abi: ABI,
                address: Addresses.B3TR as `0x${string}`,
                functionName: 'decimals',
                args: []
            },
            {
                abi: ABI,
                address: Addresses.B3TR as `0x${string}`,
                functionName: 'symbol',
                args: []
            }
        ]
    })

    if (!isConnected) {
        return <p>Please connect your wallet to view your profile.</p>
    }
    return (
        <div className='space-y-4 max-w-lg w-full'>
            <div className='text-xl font-semibold'>Profile</div>

            <dl className="grid grid-cols-2 gap-y-4">
                <dt className="font-medium text-sm">Address:</dt>
                <dd className='font-mono text-xs text-right'>{address?.slice(0, 8)}..{address?.slice(-8)}</dd>

                <dt className="font-medium text-sm">Name:</dt>
                <dd className='font-mono text-xs text-right'>{ens.data}</dd>

                <dt className="font-medium text-sm">Balance:</dt>
                {balance.isSuccess && balance.data.length === 3 && (
                    <dd className='font-mono text-xs text-right'>
                        <B3TRBalance address={address} />
                    </dd>
                )}

                <dt className="font-medium text-sm">Connected Network:</dt>
                <dd className='font-mono text-xs text-right'>{NETWORK}</dd>
            </dl>

        </div>
    )
}