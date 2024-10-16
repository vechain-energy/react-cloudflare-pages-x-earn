import { BACKEND_URL } from '~/config';
import Transaction from '~/common/Transaction';
import ErrorMessage from '~/common/ErrorMessage';
import { useAccount } from 'wagmi'
import { cn } from '~/common/utils'
import { useMutation } from '@tanstack/react-query'

export function ClaimRewardByBackend() {
    const { isConnected, address } = useAccount()

    const { mutate: claimReward, data, isPending, isError, error } = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${BACKEND_URL}/rewards/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiver: address }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
    });

    const handleSend = () => {
        claimReward();
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
                    click here to claim a reward using a backend request
                </button>
            </div>

            {isError && <ErrorMessage>{error.message}</ErrorMessage>}
            {data?.txId && <Transaction txId={data.txId} />}
        </>
    )
}