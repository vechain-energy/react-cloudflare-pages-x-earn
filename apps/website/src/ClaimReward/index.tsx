import { ClaimRewardByContract } from './ByContract';

export function ClaimReward() {
    return (
        <div className='space-y-4 max-w-lg w-full'>
            <div className='text-xl font-semibold'>Claim Reward</div>

            <div>
                <ClaimRewardByContract />
            </div>

        </div>
    )
}