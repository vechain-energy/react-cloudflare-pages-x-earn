export type ProofDetails = {
    proofTypes: string[]
    proofValues: string[]
    impactCodes: string[]
    impactValues: number[]
    description: string
}

export async function calculateProof(value: number, date: string, receiver: string, env: Env): Promise<ProofDetails> {
    const proof = {
        proofTypes: ['text', 'link'],
        proofValues: [`${value} @ ${date}`, 'https://github.com/vechain-energy/react-cloudflare-pages-x-earn'],
        impactCodes: ['carbon'],
        impactValues: [
            Math.floor(value)
        ],
        description: `text for ${value}`
    }

    return proof
}
