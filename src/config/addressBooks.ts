import { constants } from "ethers";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string) => {
  switch (network) {
    case "mainnet":
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        DAI: "",
        ADAI: "",
        RewardsController: "",
        AaveV3Pool: "",
        BreadchainMultisig: "",
      };

    case "matic":
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // MATIC
        WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        ADAI: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
        RewardsController: "0x929EC64c34a17401F460460D4B9390518E5B473e",
        AaveV3Pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        BreadchainMultisig: "0x6A148b997e6651237F2fCfc9E30330a6480519f0",
        BreadProxy: "0x11d9efDf4Ab4A3bfabf5C7089F56AA4F059AA14C",
      };

    case "mumbai":
      // Addresses retrieved from https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // MATIC
        WETH: "0xb685400156cF3CBE8725958DeAA61436727A30c3", // WMATIC
        DAI: "0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B",
        ADAI: "0xDD4f3Ee61466C4158D394d57f3D4C397E91fBc51",
        RewardsController: constants.AddressZero, // No rewards distributor on testnet?
        AaveV3Pool: "0x6C9fB0D5bD9429eb9Cd96B85B81d872281771E6B",
        BreadchainMultisig: "0x6A148b997e6651237F2fCfc9E30330a6480519f0",
        BreadProxy: "0x11d9efDf4Ab4A3bfabf5C7089F56AA4F059AA14C",
      };

    case "hardhat":
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // MATIC
        WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        ADAI: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
        RewardsController: "0x929EC64c34a17401F460460D4B9390518E5B473e",
        AaveV3Pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        BreadchainMultisig: "0x6A148b997e6651237F2fCfc9E30330a6480519f0",
        BreadProxy: "0x11d9efDf4Ab4A3bfabf5C7089F56AA4F059AA14C",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
