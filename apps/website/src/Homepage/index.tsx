import { APP_DESCRIPTION, APP_TITLE, Addresses, ABI } from '~/config';
import Transaction from '~/common/Transaction';
import ErrorMessage from '~/common/ErrorMessage';
import { useAccount, useWriteContract } from 'wagmi'

export default function Homepage() {
    const { isConnected } = useAccount()
    const { writeContract, data: txId, isPending, isError, error } = useWriteContract()

    const handleSend = async () => {
        writeContract({
            abi: ABI,
            address: Addresses.X2EarnApp as `0x${string}`,
            functionName: 'reward',
            args: [],
        })
    }


    if (!isConnected) { return 'Please connect your wallet to continue.' }

    return (
        <div className='space-y-4 max-w-lg'>
            <div className='text-xl font-semibold'>{APP_TITLE}</div>
            <p>{APP_DESCRIPTION}</p>

            <div>
                <button
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isPending ? 'opacity-25' : ''}`}
                    disabled={isPending}
                    onClick={handleSend}
                >
                    click here to claim a reward
                </button>

            </div>

            {isError && <ErrorMessage>{error.message}</ErrorMessage>}
            {txId && <Transaction txId={txId} />}
        </div>
    )
}