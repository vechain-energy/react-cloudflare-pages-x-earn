import React from 'react';
import { APP_DESCRIPTION, APP_TITLE, Addresses, ABI } from '~/config';
import { useWallet, useConnex } from '@vechain/dapp-kit-react';
import { clauseBuilder, unitsUtils } from '@vechain/sdk-core';
import Transaction from '~/common/Transaction';
import ErrorMessage from '~/common/ErrorMessage';

export default function BuyCoffee() {
    // get the connected wallet
    const { account } = useWallet();

    // and access to connex for interaction with vechain
    const connex = useConnex()

    // state for sending status
    const [txId, setTxId] = React.useState<string>('')
    const [error, setError] = React.useState<string>('')
    const handleSend = async () => {
        if (!account) { return }

        try {
            setError('')

            const abiFunc = ABI.find(abi => 'name' in abi && abi?.name === 'reward')
            if (!abiFunc) { throw new Error('Could not find reward function in ABIs') }

            const clauses = [
                {

                    ...clauseBuilder.functionInteraction(Addresses.X2EarnApp, abiFunc, []),

                    // an optional comment is shown to the user in the wallet
                    comment: 'Claim Reward',
                }
            ]

            // build a transaction for the given clauses
            const tx = connex.vendor.sign('tx', clauses)

                // requesting a specific signer will prevent the user from changing the signer to another wallet than the signed in one, preventing confusion
                .signer(account)

            // ask the user to sign the transaction
            const { txid } = await tx.request()

            // the resulting transaction id is stored to check for its status later
            setTxId(txid)
        }
        catch (err) {
            setError(String(err))
        }
    }


    if (!account) { return 'Please connect your wallet to continue.' }

    // sending is disabled if there is not signed in with an account
    const canSend = Boolean(account)
    return (
        <div className='space-y-4 max-w-lg'>
            <div className='text-xl font-semibold'>{APP_TITLE}</div>
            <p>{APP_DESCRIPTION}</p>


            <div>
                <button
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!canSend ? 'opacity-25' : ''}`}
                    disabled={!canSend}
                    onClick={handleSend}
                >
                    click here to claim a reward
                </button>

            </div>

            {Boolean(error) && <ErrorMessage>{error}</ErrorMessage>}
            <Transaction txId={txId} />
        </div>
    )
}