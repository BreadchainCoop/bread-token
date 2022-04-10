// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string) => {
  switch (network) {
    case "mainnet":
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      };

    case "matic":
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // MATIC
        WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        ADAI: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
        RewardsController: "0x929EC64c34a17401F460460D4B9390518E5B473e",
        AaveV3Pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
      };

    case "hardhat":
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // MATIC
        WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        ADAI: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
        RewardsController: "0x929EC64c34a17401F460460D4B9390518E5B473e",
        AaveV3Pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
