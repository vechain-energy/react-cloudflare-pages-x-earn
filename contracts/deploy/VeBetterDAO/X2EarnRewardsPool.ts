import { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // get access to your named accounts, check hardhat.config.ts on your configuration
    const { deployer } = await hre.getNamedAccounts();

    // deploy a contract, it will automatically deploy again when the code changes
    await hre.deployments.deploy('X2EarnRewardsPoolMock', {
        from: deployer,
        args: [
            (await hre.deployments.get('B3TR')).address
        ]
    })
};

func.id = 'app';
func.tags = ['app', 'core']

export default func;
