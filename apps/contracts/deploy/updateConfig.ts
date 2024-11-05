import { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';
import fs from "fs";
import path from "path";

const GensisToName: Record<string, string> = {
    '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a': 'main',
    '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127': 'test',
    '0x00000000c05a20fbca2bf6ae3affba6af4a74b800b585bf7a4988aba7aea69f6': 'solo'
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const B3TR = (await hre.deployments.get('B3TRMock')).address
    const X2EarnRewardsPool = (await hre.deployments.get('X2EarnRewardsPoolMock')).address
    const X2EarnApp = (await hre.deployments.get('X2EarnApp')).address
    const SimpleAccountFactory = (await hre.deployments.get('SimpleAccountFactory')).address

    const Addresses = { B3TR, X2EarnRewardsPool, X2EarnApp, SimpleAccountFactory }
    const ABI = [
        ...(await hre.deployments.get('B3TRMock')).abi,
        ...(await hre.deployments.get('X2EarnApp')).abi,
        ...(await hre.deployments.get('SimpleAccountFactory')).abi,
    ]

    // Get the genesis block ID from the network
    const genesisBlock = await hre.VeChainProvider?.thorClient.blocks.getGenesisBlock()
    const networkName = genesisBlock?.id && GensisToName[genesisBlock?.id] ? GensisToName[genesisBlock?.id] : genesisBlock?.id ?? 'unknown'

    // Ensure folders exist for all networks
    const networks = Object.values(GensisToName);
    networks.forEach(network => {
        const configPath = path.join(__dirname, "..", "..", "..", "dist", network);
        if (!fs.existsSync(configPath)) { fs.mkdirSync(configPath, { recursive: true }); }

        const configFile = path.join(configPath, "config.ts")
        if (!fs.existsSync(configFile)) { fs.writeFileSync(configFile, '') }
    });

    // Create the config file for the current network
    const configPath = path.join(__dirname, "..", "..", "..", "dist", networkName);

    const configFile = path.join(configPath, "config.ts")
    const configData = `
export const Addresses = ${JSON.stringify(Addresses)}
export const ABI = ${JSON.stringify(ABI)}
export const CONTRACTS_NODE_URL = ${JSON.stringify(hre.VeChainProvider?.thorClient.httpClient.baseURL)}
`
    fs.writeFileSync(configFile, configData)
};

func.id = 'config';
func.tags = ['config']
func.dependencies = ['vebetterdao', 'core', 'aa']

export default func;
