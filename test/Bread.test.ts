import { expect } from "chai";
import { Signer } from "@ethersproject/abstract-signer";
import hre = require("hardhat");
import { Bread, EIP173Proxy, IERC20 } from "../typechain";
import { getAddressBookByNetwork } from "../src/config";

const { ethers, network, deployments } = hre;
const addresses = getAddressBookByNetwork(network.name);
const DAI_HOLDER = "0x0405e31AB5C379BCB710D34e500E009bbB79f584"

describe("Test Bread Contract", function () {
  this.timeout(0);
  let dai: IERC20;
  let aDai: IERC20;
  let bread: Bread;
  let admin: Signer;
  let signer: Signer;
  let breadProxy: EIP173Proxy;

  before("tests", async function () {
    await deployments.fixture();
    [signer] = await ethers.getSigners();
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [addresses.BreadchainMultisig],
    });

    admin = await ethers.provider.getSigner(addresses.BreadchainMultisig);

    const breadAddress = (await deployments.get("Bread")).address;
    bread = (await ethers.getContractAt('Bread', breadAddress)) as Bread;
    bread.connect(signer).transferOwnership(await admin.getAddress());

    dai = (await ethers.getContractAt("IERC20", addresses.DAI)) as IERC20;
    aDai = (await ethers.getContractAt("IERC20", addresses.ADAI)) as IERC20;

    breadProxy = (await ethers.getContractAt("EIP173Proxy", breadAddress));

    // get some DAI from some acct
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [DAI_HOLDER],
    });

    const holder = await ethers.provider.getSigner(DAI_HOLDER);

    await dai.connect(holder).transfer(await admin.getAddress(), (await dai.balanceOf(DAI_HOLDER)).div(4));
    await dai.connect(holder).transfer(await signer.getAddress(), (await dai.balanceOf(DAI_HOLDER)).div(4));
    signer.sendTransaction({to: await admin.getAddress(), value: ethers.utils.parseEther("10")});
  });
  describe("Bread Unit Tests", async function () {
    it("mints", async function () {
        // normal mint
        const daiBefore = await dai.balanceOf(await signer.getAddress());
        const breadBefore = await bread.balanceOf(await signer.getAddress());
        await dai.connect(signer).approve(bread.address, daiBefore.div(10));
        await bread.connect(signer).mint(daiBefore.div(10), await signer.getAddress());
        const daiAfter = await dai.balanceOf(await signer.getAddress());
        const breadAfter = await bread.balanceOf(await signer.getAddress());
        expect(breadBefore).to.equal(0);
        expect(daiBefore).to.be.gt(daiAfter);
        expect(breadAfter).to.be.gt(breadBefore);
        expect(breadAfter).to.equal(daiBefore.sub(daiAfter));

        // mint to another
        const daiBeforeAdmin = await dai.balanceOf(await admin.getAddress());
        const breadBeforeAdmin = await bread.balanceOf(await admin.getAddress());
        await dai.connect(admin).approve(bread.address, daiBeforeAdmin.div(10));
        await bread.connect(admin).mint(daiBeforeAdmin.div(10), await signer.getAddress());
        const daiAfterAdmin = await dai.balanceOf(await admin.getAddress());
        const breadAfterAdmin = await bread.balanceOf(await admin.getAddress());
        const breadFinal = await bread.balanceOf(await signer.getAddress());
        expect(breadBeforeAdmin).to.equal(0);
        expect(breadBeforeAdmin).to.equal(breadAfterAdmin);
        expect(daiBeforeAdmin).to.be.gt(daiAfterAdmin);
        expect(breadFinal).to.be.gt(breadAfter);
        expect(breadFinal).to.equal(breadAfter.add(daiBeforeAdmin.sub(daiAfterAdmin)));
    });
    it("burns", async function () {

        const aDaiBalance = await aDai.balanceOf(bread.address);
        expect(aDaiBalance).to.be.gt(0);
        await expect(
            bread.connect(admin).rescueToken(aDai.address, 1)
        ).to.be.revertedWith("Bread: cannot withdraw collateral");

        // burn and credit underlying to an acct
        const supplyBefore = await bread.totalSupply();
        const daiBefore = await dai.balanceOf(await admin.getAddress());
        await bread.connect(signer).burn(supplyBefore, await admin.getAddress());
        const daiAfter = await dai.balanceOf(await admin.getAddress());
        const supplyAfter = await bread.totalSupply();
        expect(supplyBefore).to.be.gt(supplyAfter);
        expect(supplyAfter).to.equal(0);
        expect(daiAfter).to.be.gt(daiBefore);
        expect(daiAfter).to.equal(daiBefore.add(supplyBefore));
    });
    it("protects owner functions", async function () {
        await expect(
            bread.connect(signer).rescueToken(ethers.constants.AddressZero, 0)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("rescues tokens", async function () {
        const before = await dai.balanceOf(bread.address);
        await dai.connect(signer).transfer(bread.address, await dai.balanceOf(await signer.getAddress()));
        const after = await dai.balanceOf(bread.address);
        expect(before).to.eq(0);
        expect(after).to.be.gt(before);

        const adminBefore = await dai.balanceOf(await admin.getAddress());
        await bread.connect(admin).rescueToken(dai.address, after);
        const adminAfter = await dai.balanceOf(await admin.getAddress());
        expect(adminAfter).to.be.gt(adminBefore);
        expect(adminAfter).to.eq(adminBefore.add(after));
    });
    it("has correct upgradeability", async function () {
      await expect(
        breadProxy.connect(signer).transferProxyAdmin(ethers.constants.AddressZero)
      ).to.be.revertedWith("NOT_AUTHORIZED");
      await expect(
        breadProxy.connect(signer).upgradeTo(ethers.constants.AddressZero)
      ).to.be.revertedWith("NOT_AUTHORIZED");

      await breadProxy
        .connect(admin)
        .upgradeTo(ethers.constants.AddressZero);
      await breadProxy
        .connect(admin)
        .transferProxyAdmin(ethers.constants.AddressZero);

      const proxyAdmin = await breadProxy.proxyAdmin();
      expect(proxyAdmin).to.equal(ethers.constants.AddressZero);
    });
  });
});