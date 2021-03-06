import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressBookByNetwork } from "../src/config";
import { DeployFunction } from "hardhat-deploy/types";
import { sleep } from "../src/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name === "matic") {
    console.log(
      `Deploying Bread to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const {
    DAI,
    ADAI,
    AaveV3Pool,
    RewardsController,
    BreadchainMultisig
  } = getAddressBookByNetwork(hre.network.name);

  await deploy("Bread", {
    from: deployer,
    proxy: {
      proxyContract: 'EIP173Proxy',
      owner: BreadchainMultisig,
      execute: {
        methodName: 'initialize',
        args: ["Breadchain Stablecoin", "BREAD"]
      }
    },
    args: [DAI, ADAI, AaveV3Pool, RewardsController],
    log: hre.network.name !== "hardhat" ? true : false,
    //gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
  });
};

export default func;

func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const shouldSkip =
    hre.network.name === "matic" ||
    hre.network.name === "goerli";
  return shouldSkip ? true : false;
};

func.tags = ["Bread"];
