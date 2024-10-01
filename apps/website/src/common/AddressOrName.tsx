import { useWalletName } from "@vechain.energy/dapp-kit-hooks";

export function AddressName({ address, short = false }: { address: string, short?: boolean }) {
    const { name } = useWalletName(address)

    if (short && !name) {
        return `${address.slice(0, 3)}..${address.slice(-4)}`
    }

    if (short && name) {
        return `${name.slice(0, 3)}..${name.slice(-4)}`
    }

    return name || address
}