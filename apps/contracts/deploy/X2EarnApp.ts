import { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // get access to your named accounts, check hardhat.config.ts on your configuration
    const { deployer } = await hre.getNamedAccounts();

    // deploy a contract, it will automatically deploy again when the code changes
    await hre.deployments.deploy('X2EarnApp', {
        from: deployer,
        args: [
            (await hre.deployments.get('X2EarnRewardsPoolMock')).address
        ]
    })
};

func.id = 'app';
func.tags = ['app', 'core']
func.dependencies = ['vebetterdao']

export default func;
