import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deploySimpleAccountFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()

  const entrypoint = await hre.deployments.get('EntryPoint')
  await hre.deployments.deploy(
    'SimpleAccountFactory', {
    from: deployer,
    args: [entrypoint.address],
    gasLimit: 6e6,
    log: true,
  })
}


deploySimpleAccountFactory.id = 'aa-factory';
deploySimpleAccountFactory.tags = ['aa', 'factory']
deploySimpleAccountFactory.dependencies = ['aa-entrypoint']

export default deploySimpleAccountFactory
