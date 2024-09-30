import { useWallet, WalletButton } from "@vechain/dapp-kit-react";
import { useWalletName } from "@vechain.energy/dapp-kit-hooks";

export default function LayoutMenu() {
    const { account } = useWallet()
    const { name } = useWalletName(account)

    if (account) {
        return (
            <WalletButton title={name || account} />
        )
    }

    return <WalletButton />
}