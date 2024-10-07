import { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';
import { X2EarnApp } from '../typechain-types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // get access to your named accounts, check hardhat.config.ts on your configuration
    const { deployer, rewarder } = await hre.getNamedAccounts();

    // deploy a contract, it will automatically deploy an upgrade when the code changes
    await hre.deployments.deploy('X2EarnApp', {
        from: deployer,
        log: true,
        proxy: {
            owner: deployer,
            proxyContract: 'UUPS',
            checkProxyAdmin: true,
            checkABIConflict: true,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [
                        deployer,
                        deployer,
                        (await hre.deployments.get('X2EarnRewardsPoolMock')).address
                    ],
                }
            },
            upgradeFunction: {
                methodName: "upgradeToAndCall",
                upgradeArgs: ['{implementation}', '{data}']
            }
        }
    });

    const x2EarnApp = await hre.ethers.getContract('X2EarnApp', deployer) as X2EarnApp
    const rewarderRoleId = await x2EarnApp.REWARDER_ROLE()
    if (!(await x2EarnApp.hasRole(rewarderRoleId, rewarder))) {
        console.log('Granting rewarder Permissions');
        await x2EarnApp.grantRole(rewarderRoleId, rewarder)
    }
};

func.id = 'app';
func.tags = ['app', 'core']
func.dependencies = ['vebetterdao']

export default func;
