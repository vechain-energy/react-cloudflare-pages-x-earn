export async function calculateReward(value: number, receiver: string, env: Env): Promise<number> {
    return Math.floor(value / 1000)
}