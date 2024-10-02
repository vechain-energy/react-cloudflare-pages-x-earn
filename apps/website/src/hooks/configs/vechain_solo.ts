export const solo = {
    "id": "20257036855429895315704288894496386224204271168750785572924599986678" as unknown as number,
    "name": "vechain_solo",
    "network": "homestead",
    "nativeCurrency": {
        "name": "VeChainThor",
        "symbol": "VET",
        "decimals": 18
    },
    "rpcUrls": {
        "public": {
            "http": [
                "http://localhost:8669"
            ]
        },
        "default": {
            "http": [
                "http://localhost:8669"
            ]
        }
    },
    "contracts": {
    },
    "batch": {
        "multicall3": false
    },
    "blockExplorers": {
        "default": {
            "name": "Explorer",
            "url": "http://localhost:8080"
        }
    }
}
