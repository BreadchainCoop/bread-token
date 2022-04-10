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

  await deploy("Bread", {
    from: deployer,
    args: [],
    log: hre.network.name !== "hardhat" ? true : false,
    //gasPrice: hre.ethers.utils.parseUnits("40", "gwei"),
  });
};

export default func;

func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const shouldSkip = hre.network.name === "matic";
  return shouldSkip ? true : false;
};

func.tags = ["Bread"];
