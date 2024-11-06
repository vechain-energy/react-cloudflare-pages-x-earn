import { createContext, useContext, useState, useEffect } from 'react'
import { usePrivy, useWallets, type ConnectedWallet } from '@privy-io/react-auth'
import { encodeFunctionData, decodeFunctionResult } from 'viem'
import type { Abi } from 'viem/_types'
import { Address, Secp256k1, Transaction, Hex, type Clause } from '@vechain/sdk-core'
import type { VeChainAccountProviderProps } from './types'
import { Addresses, ABI, NODE_URL, DELEGATION_URL } from '~/config'
import estimateGas from '@vechain.energy/gas'

interface VeChainAccountContextType {
    address: string | undefined;
    embeddedWallet: ConnectedWallet | undefined;
    sendTransaction: (tx: { to?: string; value?: string | number | bigint; data?: string | { abi: Abi[] | readonly unknown[]; functionName: string; args: any[] } }) => Promise<string>;
    exportWallet: () => Promise<void>;
    nodeUrl: string
    delegatorUrl: string
    accountFactory: string
}

const generateRandomTransactionUser = async () => {
    const privateKey = await Secp256k1.generatePrivateKey();
    const address = Address.ofPrivateKey(privateKey);
    return {
        privateKey,
        address
    }
}

const VechainAccountContext = createContext<VeChainAccountContextType | null>(null)

export const VeChainAccountProvider = ({ children, nodeUrl, delegatorUrl, accountFactory }: VeChainAccountProviderProps) => {
    const { signTypedData, exportWallet } = usePrivy()
    const { wallets } = useWallets()
    const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
    const [address, setAddress] = useState<string | undefined>()
    const [chainId, setChainId] = useState('')

    /**
     * load the address of the account abstraction wallet identified by the embedded wallets address
     * it is the origin for on-chain-interaction with other parties
     */
    useEffect(() => {
        if (!embeddedWallet?.address) { return }

        fetch(`${NODE_URL}/accounts/*`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                clauses: [
                    {
                        to: Addresses.SimpleAccountFactory,
                        value: '0x0',
                        data: encodeFunctionData({
                            abi: ABI,
                            functionName: 'getAddress',
                            args: [embeddedWallet.address, BigInt(embeddedWallet.address)]
                        })
                    }
                ]
            })
        })
            .then(res => res.json() as Promise<{ data: string, reverted: boolean }[]>)
            .then(result => {
                if (result && result.length > 0 && !result[0].reverted) {
                    const address = decodeFunctionResult({
                        abi: ABI,
                        functionName: 'getAddress',
                        data: result[0].data
                    })
                    setAddress(address)
                }
                else {
                    console.error('Could not fetch address from Account Factory', result)
                }
            })
            .catch(err => console.error('Could not fetch address from Account Factory', err))
    }, [embeddedWallet])


    /**
     * identify the current chain from its genesis block
     */
    useEffect(() => {
        fetch(`${NODE_URL}/blocks/0`)
            .then(res => res.json() as Promise<Connex.Thor.Block>)
            .then(genesis => genesis?.id && setChainId(BigInt(genesis.id).toString()))
            .catch(() => {/* ignore */ })
    }, [])

    // reset address when embedded wallet vanishes
    useEffect(() => {
        if (!embeddedWallet) { setAddress(undefined) }
    }, [embeddedWallet])


    const sendTransaction = async ({
        to,
        value = 0,
        data: funcData = '0x',
        title = 'Sign Transaction',
        description,
        buttonText = 'Sign'
    }:
        {
            to?: string,
            value?: number | string | bigint,
            data?: string | {
                abi: Abi[] | readonly unknown[],
                functionName: string,
                args: any[]
            }
            validAfter?: number
            validBefore?: number,
            title?: string,
            description?: string,
            buttonText?: string
        }): Promise<string> => {

        if (!address) { throw new Error('Address could not be load'); }
        if (!embeddedWallet) { throw new Error('Embedded wallet is missing'); }

        // build the object to be signed, containing all information & instructions
        const data = {
            /**
             * the domain is configured in the contracts by this call:
             *  __EIP712_init("Wallet", "1") 
             */
            domain: {
                name: "Wallet",
                version: "1",
                chainId: chainId as unknown as number,  // work around the viem limitation that chainId must be a number but its too big to be handled as such
                verifyingContract: address
            },

            // type definitions, can be multiples, can be put into a configurational scope
            types: {
                /**
                 * the ExecuteWithAuthorization is basically the function definition of 
                 */
                ExecuteWithAuthorization: [
                    { name: "to", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "data", type: "bytes" },
                    { name: "validAfter", type: "uint256" },
                    { name: "validBefore", type: "uint256" }
                ],
            },
            primaryType: "ExecuteWithAuthorization",

            /**
             * the message to sign, it is basically the instructions for an execute command
             * to, value and data are transaction relevant
             * validAfter & validBefore are good to limit authorization and will be checked with block.timestamp
             */
            message: {
                // valid by default right now, could also limit for future use
                validAfter: 0,

                // valid for an hour
                validBefore: Math.floor(Date.now() / 1000) + 3600,

                // the transaction instructions
                to,
                value: String(value),

                // decide if the data needs to be encoded first or can be passed directly
                data: typeof (funcData) === 'object' && 'abi' in funcData ? encodeFunctionData(funcData) : funcData,
            },
        }

        /**
         * request a signature using privy
         * the information is show to the user in a modal
         */
        const signature = await signTypedData(data, {
            title,
            description: description ?? (typeof (funcData) === 'object' && 'functionName' in funcData ? funcData.functionName : ' '),
            buttonText
        })

        /**
         * start building the clauses for the transaction
         */
        const clauses: Omit<Clause, 'amount'>[] = []

        /**
         * if the account address has no code yet, its not been deployed/created yet
         * so we'll instructt the factory to create a wallet
         */
        const { hasCode: isDeployed } = await fetch(`${NODE_URL}/accounts/${address}`).then(res => res.json()) as Connex.Thor.Account
        if (!isDeployed) {
            clauses.push({
                to: accountFactory,
                value: '0x0',
                data: encodeFunctionData({
                    abi: ABI,
                    functionName: 'createAccount',
                    args:
                        // as identifier/salt we'll use the embedded wallets address, who will also be the owner
                        [
                            embeddedWallet.address,
                            BigInt(embeddedWallet.address)
                        ]
                })
            })
        }

        /**
         * build the transaction call to the SimpleAccount
         * by passing in all dynamic data that was signed
         * which includes the to be executed transaction instructions
         */
        clauses.push({
            to: address,
            value: '0x0',
            data: encodeFunctionData({
                abi: [
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "value",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes",
                                "name": "data",
                                "type": "bytes"
                            },
                            {
                                "internalType": "uint256",
                                "name": "validAfter",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "validBefore",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes",
                                "name": "signature",
                                "type": "bytes"
                            }
                        ],
                        "name": "executeWithAuthorization",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ],
                functionName: 'executeWithAuthorization',
                args: [
                    data.message.to as `0x${string}`,
                    BigInt(data.message.value),
                    data.message.data as `0x${string}`,
                    BigInt(data.message.validAfter),
                    BigInt(data.message.validBefore),
                    signature as `0x${string}`
                ]
            })
        })

        const signedTransaction = await clauseToTransaction(clauses)

        /**
         * publish the hexlified signed transaction directly on the node api
         */
        const { id } = await fetch(`${nodeUrl}/transactions`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                raw: Hex.of(signedTransaction.encoded).toString()
            })
        }).then(res => res.json()) as { id: string }

        return id
    }

    return (
        <VechainAccountContext.Provider value={{
            address,
            accountFactory,
            nodeUrl,
            delegatorUrl,
            embeddedWallet,
            sendTransaction,
            exportWallet
        }}>
            {children}
        </VechainAccountContext.Provider>
    )
}

export const useVeChainAccount = () => {
    const context = useContext(VechainAccountContext)
    if (!context) {
        throw new Error('useVeChainAccount must be used within a VeChainAccountProvider')
    }
    return context
}

async function clauseToTransaction(clauses: Clause[]): Promise<Transaction> {
    // generate random user to have something to publish the transaction
    const randomTransactionUser = await generateRandomTransactionUser()

    // estimate the gas fees for the transaction
    const gasResult = await estimateGas(clauses, { nodeOrConnex: NODE_URL, caller: randomTransactionUser.address.toString() })

    // .. and build the transaction in VeChain format, with delegation enabled
    const bestBlock = await fetch(`${NODE_URL}/blocks/best`).then(res => res.json() as Promise<Connex.Thor.Block>)
    const genesisBlock = await fetch(`${NODE_URL}/blocks/0`).then(res => res.json() as Promise<Connex.Thor.Block>)
    const transaction = Transaction.of({
        blockRef: bestBlock.id.slice(0, 18), // block this tx will be built upon, expiration starts here
        chainTag: Number(`0x${genesisBlock.id.slice(64)}`),
        clauses,
        dependsOn: null,
        expiration: 32,
        gas: gasResult,
        gasPriceCoef: 0,
        nonce: 0,
        reserved: {
            features: 1
        }
    })

    /**
     * sign the transaction
     * and request the fee delegator to pay the gas fees in the proccess
     */
    const delegatorResponse = await fetch(DELEGATION_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            origin: randomTransactionUser.address.toString(),
            raw: Hex.of(transaction.encoded).toString(),
        })
    }).then(res => res.json() as Promise<{ signature: string, address: string } | { code: string, message: string }>)

    // if delegator rejects sponsorship
    if ('message' in delegatorResponse) {
        throw Error(delegatorResponse.message)
    }

    // transaction signature is origin + delegator combined
    const delegatorSignature = Hex.of(delegatorResponse.signature)
    const originSignature = Hex.of(Secp256k1.sign(
        transaction.getTransactionHash().bytes,
        randomTransactionUser.privateKey
    ))
    const transactionSignature = new Uint8Array([...originSignature.bytes, ...delegatorSignature.bytes]);
    const signedTransaction = Transaction.of(transaction.body, transactionSignature)

    return signedTransaction
}