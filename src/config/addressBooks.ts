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
      };

    case "hardhat":
      return {
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // MATIC
        WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
