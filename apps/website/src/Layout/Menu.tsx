import { useAccount, useReadContract } from 'wagmi'
import { Addresses, ABI } from '~/config'
import { WalletAuth } from '~/common/Buttons/WalletAuth'

export default function LayoutMenu() {
    const { address } = useAccount()

    const balance = useReadContract({
        abi: ABI,
        address: Addresses.B3TR as `0x${string}`,
        functionName: 'balanceOf',
        args: [address]
    })

    return (
        <div className='flex items-center justify-end space-x-8'>
            <span className='text-sm font-mono'>Balance: {String(balance.data ?? 0)}</span>
            <WalletAuth />
        </div>
    )
}