import { useAccount } from 'wagmi'
import { WalletAuth } from '~/common/Buttons/WalletAuth'
import { B3TRBalance } from '~/common/B3TRBalance'
import { Link } from 'react-router-dom'

export default function LayoutMenu() {
    const { address } = useAccount()

    return (
        <div className='flex items-center justify-end space-x-8'>
            <nav className="flex space-x-4">
                <Link to="/" className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Home</Link>
                <Link to="/claim" className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Claim Reward</Link>
                <Link to="/me" className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Profile</Link>
            </nav>
            <span className='text-xs font-mono'><B3TRBalance address={address} /></span>
            <WalletAuth />
        </div>
    )
}