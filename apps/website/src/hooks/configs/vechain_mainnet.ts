export const mainnet = {
    "id": "14018334920824264607324960081104126964451224218731128041714701303808" as unknown as number,
    "name": "vechain_mainnet",
    "network": "homestead",
    "nativeCurrency": {
        "name": "VeChainThor",
        "symbol": "VET",
        "decimals": 18
    },
    "rpcUrls": {
        "public": {
            "http": [
                "https://node-mainnet.vechain.energy"
            ]
        },
        "default": {
            "http": [
                "https://node-mainnet.vechain.energy"
            ]
        }
    },
    "contracts": {
        "ensRegistry": {
            "address": "0xa9231da8BF8D10e2df3f6E03Dd5449caD600129b" as `0x${string}`
        },
        "ensBaseRegistrarImplementation": {
            "address": "0x6e04F400810Be5C570c08Ea2def43c4d44481063" as `0x${string}`
        },
        "ensDnsRegistrar": {
            "address": "0x0000000000000000000000000000000000000000" as `0x${string}`
        },
        "ensEthRegistrarController": {
            "address": "0x07479F2710d16a0bACbE6C25b9b32447364C0A33" as `0x${string}`
        },
        "ensNameWrapper": {
            "address": "0x1c8Adf6d8E6302d042b1f09baD0c7f65dE3660eA" as `0x${string}`
        },
        "ensPublicResolver": {
            "address": "0xabac49445584C8b6c1472b030B1076Ac3901D7cf" as `0x${string}`
        },
        "ensReverseRegistrar": {
            "address": "0x5c970901a587BA3932C835D4ae5FAE2BEa7e78Bc" as `0x${string}`
        },
        "ensBulkRenewal": {
            "address": "0x793eBb866c7Db6b3e6336861456938D67379d623" as `0x${string}`
        },
        "ensDnssecImpl": {
            "address": "0x0000000000000000000000000000000000000000" as `0x${string}`
        },
        "ensUniversalResolver": {
            "address": "0x3dEB91b387d1e0A2ceB9aDd2AdF43Add1a922569" as `0x${string}`
        },
        "multicall3": {
            "address": "0xfB906D3Ef66cb80fc2E7A79E03228a720b1401F6" as `0x${string}`
        },
        "vetResolveUtils": {
            "address": "0xA11413086e163e41901bb81fdc5617c975Fa5a1A" as `0x${string}`
        },
        "vetWeb2Domains": {
            "address": "0x18BB2f517317fDbB8B207fa8f08DB35B88C2aa90" as `0x${string}`
        },
        "vetSignedRegistrarController": {
            "address": "0xCD0402b23D01133EfD5ABab0e2c82EA91926F136" as `0x${string}`
        },
        "vetNFTRegistrarController": {
            "address": "0xc7bF178B1AbE7A9cE26F661189479d061c073cA5" as `0x${string}`
        },
        "venOracle": {
            "address": "0x49eC7192BF804Abc289645ca86F1eD01a6C17713" as `0x${string}`
        }
    },
    "subgraphs": {
        "ens": {
            "url": "https://graph.vet/subgraphs/name/vns/"
        }
    },
    "batch": {
        "multicall3": true
    },
    "blockExplorers": {
        "default": {
            "name": "Explorer",
            "url": "https://vechainstats.com"
        }
    }
}