import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployEntryPoint: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()

  const ret = await hre.deployments.deploy(
    'EntryPoint', {
    from: deployer,
    args: [],
    log: true
  })
  console.log('==entrypoint addr=', ret.address)
}

deployEntryPoint.id = 'aa-entrypoint';
deployEntryPoint.tags = ['aa', 'entrypoint']

export default deployEntryPoint
