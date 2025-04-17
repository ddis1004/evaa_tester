import {
  Evaa,
  EvaaUser,
  MAINNET_LP_POOL_CONFIG,
  MAINNET_POOL_CONFIG,
  Prices,
  TESTNET_POOL_CONFIG,
  TON_MAINNET,
  TON_TESTNET,
} from "@evaafi/sdk";
import { useClient, useEvaa } from "./hooks";
import { Address, Dictionary } from "@ton/ton";
import { printLendData } from "./loanDataPrinter";
import { configDotenv } from "dotenv";

// 콘솔 로그와 디버그 로그 비활성화
const originalConsoleLog = console.log;
const originalConsoleDebug = console.debug;
console.log = () => {}; // 콘솔 로그 비활성화
console.debug = () => {}; // 디버그 로그 비활성화

async function run() {
  configDotenv();
  const sender = Address.parse(process.env.ADDRESS_2!!);
  const client = useClient();
  const evaa = client.open(new Evaa({ poolConfig: MAINNET_LP_POOL_CONFIG }));
  const userContract = evaa.getOpenedUserContract(sender);
  console.log("userContract Address:", userContract.address);

  await evaa.getSync();

  const priceCollector = evaa.createPriceCollector();
  const priceData = await priceCollector.getPrices();

  // 디버그 로그를 활성화할 부분에서 다시 원본 함수로 복원
  console.debug = originalConsoleDebug;

  await userContract.getSync(evaa.data!.assetsData, evaa.data!.assetsConfig, priceData.dict);

  // 콘솔 로그를 다시 원본 함수로 복원
  console.log = originalConsoleLog;

  printLendData(userContract.data!, MAINNET_LP_POOL_CONFIG.poolAssetsConfig);
}

run();
