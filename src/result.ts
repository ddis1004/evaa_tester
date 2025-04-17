import { Evaa, EvaaUser, Prices } from "@evaafi/sdk";
import { useClient, useEvaa } from "./hooks";
import { Address, Dictionary } from "@ton/ton";
import { MAINNET_LP_POOL_CONFIG } from "@evaafi/sdk";
import { configDotenv } from "dotenv";

async function run() {
  configDotenv();
  const sender = Address.parse(process.env.ADDRESS_1!!);
  const client = useClient();
  const evaa = client.open(new Evaa({ poolConfig: MAINNET_LP_POOL_CONFIG }));

  await evaa.getSync();

  const priceCollector = evaa.createPriceCollector();
  const priceData = await priceCollector.getPrices();

  await cc.getSync(evaa.data!.assetsData, evaa.data!.assetsConfig, priceData.dict);
}

run();
