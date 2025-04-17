import {
  Evaa,
  MAINNET_ALTS_POOL_CONFIG,
  MAINNET_LP_POOL_CONFIG,
  MAINNET_POOL_CONFIG,
  PoolConfig,
  TESTNET_POOL_CONFIG,
} from "@evaafi/sdk";
import { OpenedContract, TonClient } from "@ton/ton";
import { configDotenv } from "dotenv";

export const useClient = (): TonClient => {
  configDotenv();

  if (process.env.NETWORK === "testnet") {
    return new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
      apiKey: process.env.RPC_API_KEY,
    });
  } else if (process.env.NETWORK === "mainnet") {
    return new TonClient({
      endpoint: "https://toncenter.com/api/v2/jsonRPC",
      apiKey: process.env.RPC_API_KEY,
    });
  } else {
    throw new Error(`Unsupported NETWORK: ${process.env.NETWORK}`);
  }
};

export const useEvaa = (client: TonClient, poolType: string = "main"): OpenedContract<Evaa> => {
  const network = process.env.NETWORK;

  const poolConfigMap: Record<string, Record<string, PoolConfig>> = {
    testnet: {
      main: TESTNET_POOL_CONFIG,
    },
    mainnet: {
      main: MAINNET_POOL_CONFIG,
      LP: MAINNET_LP_POOL_CONFIG,
      ALTS: MAINNET_ALTS_POOL_CONFIG,
    },
  };

  const poolConfig = poolConfigMap[network || ""]?.[poolType];

  if (!poolConfig) {
    throw new Error(`Invalid network '${network}' or pool type '${poolType}'`);
  }
  // console.log("creating evaa with config: ", poolConfig);
  return client.open(new Evaa({ poolConfig }));
};
