import { ClaimRewardByContract } from './ByContract';
import { ClaimRewardByBackend } from './ByBackend';
import { ClaimRewardByBackendProcess } from './ByBackendProcess'

export function ClaimReward() {
    return (
        <div className='space-y-4 max-w-lg w-full'>
            <div className='text-xl font-semibold'>Claim Reward</div>

            <div className='space-y-8'>
                <ClaimRewardByContract />
                <ClaimRewardByBackend />
                <ClaimRewardByBackendProcess />
            </div>

        </div>
    )
}