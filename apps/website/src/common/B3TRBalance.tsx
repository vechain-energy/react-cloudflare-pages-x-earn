import { useReadContracts } from 'wagmi'
import { Addresses, ABI } from '~/config'
import { formatUnits } from 'viem'
import { useBeats } from '~/hooks/useBeats'
import { useEffect } from 'react'

export function B3TRBalance({ address }: { address?: `0x${string}` }) {
    const update = useBeats([address])
    const balance = useReadContracts({
        contracts: [
            {
                abi: ABI,
                address: Addresses.B3TR as `0x${string}`,
                functionName: 'balanceOf',
                args: [address]
            },
            {
                abi: ABI,
                address: Addresses.B3TR as `0x${string}`,
                functionName: 'decimals',
                args: []
            },
            {
                abi: ABI,
                address: Addresses.B3TR as `0x${string}`,
                functionName: 'symbol',
                args: []
            }
        ],
        query: {
            enabled: Boolean(address)
        }
    })

    useEffect(() => {
        Boolean(address) && balance.refetch()
    }, [address, update, balance.refetch])

    if (address && balance.isSuccess && balance.data.length === 3) {
        return (
            <span>
                {formatUnits(BigInt(String(balance.data[0].result)), Number(balance.data[1].result))}
                {' '}
                {String(balance.data[2].result)}
            </span>

        );
    }

    return null

}