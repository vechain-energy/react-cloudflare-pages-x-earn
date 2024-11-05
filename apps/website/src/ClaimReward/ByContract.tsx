import { useState } from 'react';
import { Addresses, ABI } from '~/config';
import Transaction from '~/common/Transaction';
import ErrorMessage from '~/common/ErrorMessage';
import { useAccount, useWriteContract } from 'wagmi'
import { cn } from '~/common/utils'
import { useVeChainAccount } from '~/modules/smart-accounts';

export function ClaimRewardByContract() {
    const { isConnected } = useAccount()
    const { writeContract, data: txId, isPending, isError, error } = useWriteContract()
    const { sendTransaction } = useVeChainAccount()

    const handleSend = async () => {
        writeContract({
            abi: ABI,
            address: Addresses.X2EarnApp as `0x${string}`,
            functionName: 'reward',
            args: [],
        })
    }

    const [isLoading, setIsLoading] = useState(false)
    const [txId2, setTxId2] = useState<string | undefined>()
    const [error2, setError2] = useState<string | undefined>()
    const handleSend2 = async () => {
        setIsLoading(true)
        try {
            const txId = await sendTransaction({
                to: Addresses.X2EarnApp,
                value: 0,
                address: Addresses.X2EarnApp as `0x${string}`,
                functionName: 'reward',
                args: [],
            });
            setTxId2(txId);
        }
        catch (error: any) {
            console.log(error)
            setError2('message' in error ? error.message : String(error));
        }
        finally {
            setIsLoading(false)
        }
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
                    wagmi: click here to claim a reward using a transaction
                </button>
            </div>

            {isError && <ErrorMessage>{error.message}</ErrorMessage>}
            {txId && <Transaction txId={txId} />}

---

            <div>
                <button
                    className={
                        cn(
                            "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                            isDisabled ? 'opacity-25' : ''
                        )
                    }
                    disabled={isDisabled}
                    onClick={handleSend2}
                >
                    smart vechain: click here to claim a reward using a transaction
                </button>
            </div>

            {Boolean(error2) && <ErrorMessage>{error2}</ErrorMessage>}
            {txId2 && <Transaction txId={txId2} />}
        </>
    )
}