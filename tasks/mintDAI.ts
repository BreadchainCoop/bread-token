import { formatEther, parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { getAddressBookByNetwork } from "../src/config";
import { IMintable__factory } from "../typechain";

const AVAILABLE_NETWORKS = ["mumbai"];

task("mintDAI", "Sends DAI accepted by AAVE to the specified address")
  .addParam("to", "recipient of the funds")
  .addParam("amount", "amount of weiDAI to send", parseEther("100").toString())
  .addOptionalParam(
    "gasprice",
    "gas price (in wei) to use when sending the mint transaction"
  )
  .setAction(async ({ to, amount, gasprice }, hre) => {
    const { network, deployments, getNamedAccounts, ethers } = hre;

    if (!AVAILABLE_NETWORKS.includes(network.name))
      throw new Error(
        `Network ${
          network.name
        } unavailable. Must be one of: [${AVAILABLE_NETWORKS.join(",")}]`
      );

    const deployer = await getNamedAccounts().then(({ deployer }) =>
      ethers.getSigner(deployer)
    );

    const dai = IMintable__factory.connect(
      getAddressBookByNetwork(network.name).DAI,
      deployer
    );

    console.log(`\t> Sending ${formatEther(amount)} DAI to ${to}`);
    await dai.mint(to, amount, { gasPrice: gasprice }).then((tx) => tx.wait());
    console.log(`\t> Transaction confirmed`);
  });
