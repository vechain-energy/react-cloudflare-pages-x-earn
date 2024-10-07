import { Addresses, ABI } from '~/config';
import Transaction from '~/common/Transaction';
import ErrorMessage from '~/common/ErrorMessage';
import { useAccount, useWriteContract } from 'wagmi'
import { cn } from '~/common/utils'

export function ClaimRewardByContract() {
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

    const isDisabled = isPending || !isConnected

    return (
        <>

            <div>
                <button
                    className={
                        cn(
                            "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                            isDisabled ? 'opacity-25' : ''
                        )
                    }
                    disabled={isDisabled}
                    onClick={handleSend}
                >
                    click here to claim a reward using a transaction
                </button>

            </div>

            {isError && <ErrorMessage>{error.message}</ErrorMessage>}
            {txId && <Transaction txId={txId} />}
        </>
    )
}