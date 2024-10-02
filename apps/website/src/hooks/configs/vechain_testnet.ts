export const testnet = {
    "id": "1176455790972829927178843975305401940018261314401477529965699268608" as unknown as number,
    "name": "vechain_testnet",
    "network": "homestead",
    "nativeCurrency": {
        "name": "VeChainThor",
        "symbol": "VET",
        "decimals": 18
    },
    "rpcUrls": {
        "public": {
            "http": [
                "https://node-testnet.vechain.energy"
            ]
        },
        "default": {
            "http": [
                "https://node-testnet.vechain.energy"
            ]
        }
    },
    "contracts": {
        "ensRegistry": {
            "address": "0xcBFB30c1F267914816668d53AcBA7bA7c9806D13" as `0x${string}`
        },
        "ensBaseRegistrarImplementation": {
            "address": "0xca1B72286B96F30391aBB96C7d5e3Bf2D767927d" as `0x${string}`
        },
        "ensDnsRegistrar": {
            "address": "0x0000000000000000000000000000000000000000" as `0x${string}`
        },
        "ensEthRegistrarController": {
            "address": "0xAA854565401724f7061E0C366cA132c87C1e5F60" as `0x${string}`
        },
        "ensNameWrapper": {
            "address": "0x67d8D01cF0d6d9ed2c120FfF1D4Fa86fC10C9D8e" as `0x${string}`
        },
        "ensPublicResolver": {
            "address": "0xA6eFd130085a127D090ACb0b100294aD1079EA6f" as `0x${string}`
        },
        "ensReverseRegistrar": {
            "address": "0x6878f1aD5e3015310CfE5B38d7B7071C5D8818Ca" as `0x${string}`
        },
        "ensBulkRenewal": {
            "address": "0x23aEe21815FDfcba86882c8b10502514a77eFd8A" as `0x${string}`
        },
        "ensDnssecImpl": {
            "address": "0x0000000000000000000000000000000000000000" as `0x${string}`
        },
        "ensUniversalResolver": {
            "address": "0x77fCCE52D4635F9a6a5E06e44aB05c0d5D96D187" as `0x${string}`
        },
        "multicall3": {
            "address": "0x736eAC86d704d8AD13Bb97628928c46dCb7Ad9ef" as `0x${string}`
        },
        "vetResolveUtils": {
            "address": "0xc403b8EA53F707d7d4de095f0A20bC491Cf2bc94" as `0x${string}`
        },
        "vetWeb2Domains": {
            "address": "0xABfaE1B040e0474a70b120Fc32d638edB01F4aE6" as `0x${string}`
        },
        "vetSignedRegistrarController": {
            "address": "0x5022d5709d1A29d777F6426C3131619c8dbD4BFf" as `0x${string}`
        },
        "vetNFTRegistrarController": {
            "address": "0x66508ecD128Bf44035b46a0E5F548f09A2eAF40d" as `0x${string}`
        },
        "venOracle": {
            "address": "0xdcCAaBd81B38e0dEEf4c202bC7F1261A4D9192C6" as `0x${string}`
        }
    },
    "batch": {
        "multicall3": true
    },
    "blockExplorers": {
        "default": {
            "name": "Explorer",
            "url": "https://explore-testnet.vechain.org"
        }
    }
}
