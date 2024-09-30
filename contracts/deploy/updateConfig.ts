import { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';
import fs from "fs";
import path from "path";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const B3TR = (await hre.deployments.get('B3TRMock')).address
    const X2EarnRewardsPool = (await hre.deployments.get('X2EarnRewardsPoolMock')).address
    const X2EarnApp = (await hre.deployments.get('X2EarnApp')).address

    const Addresses = { B3TR, X2EarnRewardsPool, X2EarnApp }
    const ABI = [...(await hre.deployments.get('X2EarnApp')).abi]

    const configPath = path.join(__dirname, "..", "..", "dist")
    if (!fs.existsSync(configPath)) { fs.mkdirSync(configPath) }

    const configFile = path.join(configPath, "config.ts")
    const configData = `
export const Addresses = ${JSON.stringify(Addresses)}
export const ABI = ${JSON.stringify(ABI)}
`
    fs.writeFileSync(configFile, configData)
};

func.id = 'config';
func.tags = ['config']
func.dependencies = ['vebetterdao', 'core']

export default func;
