import { Evaa, MAINNET_POOL_CONFIG, TESTNET_POOL_CONFIG, UserDataActive } from "@evaafi/sdk";
import { Address, TonClient } from "@ton/ton";
import { configDotenv } from "dotenv";

export interface LendDataObject {
  healthFactor: number;
  supplyBalance: bigint;
  borrowBalance: bigint;
  realPrincipals: Record<string, string>;
  balances: Record<string, string>;
}

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

export async function getLendDataObject() {
  configDotenv();
  // temp console.log off : priceCollector writes unnecessary log
  const originalConsoleLog = console.log;
  const originalConsoleDebug = console.debug;
  console.log = () => {};
  console.debug = () => {};

  try {
    const client = useClient();
    const evaaConfig = process.env.NETWORK === "mainnet" ? MAINNET_POOL_CONFIG : TESTNET_POOL_CONFIG;
    const evaa = client.open(new Evaa({ poolConfig: evaaConfig }));
    await evaa.getSync();

    const priceCollector = evaa.createPriceCollector();
    const priceData = await priceCollector.getPrices();

    const userContract = evaa.getOpenedUserContract(Address.parse(process.env.EVAA_HANDLER!));
    if (evaa.data) {
      await userContract.getSync(evaa.data.assetsData, evaa.data.assetsConfig, priceData.dict);
    }

    let data = null;
    if (userContract.data && userContract.data.type === "active") {
      data = parseLendDataObject(userContract.data, evaaConfig.poolAssetsConfig);
    }

    //console log on again
    console.debug = originalConsoleDebug;
    console.log = originalConsoleLog;
    return data;
  } catch (error) {
    //console log on again
    console.debug = originalConsoleDebug;
    console.log = originalConsoleLog;
    console.error(error);
  }

  return null;
}

function formatWithDecimals(value: bigint, decimals: number): string {
  // 1) 음수 처리
  if (value < 0n) {
    return "-" + formatWithDecimals(-value, decimals);
  }
  // 2) 절대값을 문자열로, 최소 digits = decimals + 1
  const s = value.toString().padStart(decimals + 1, "0");
  const intPart = s.slice(0, -decimals);
  let fracPart = s.slice(-decimals).replace(/0+$/, ""); // 우측 0 제거
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}
function parseLendDataObject(data: UserDataActive, assetConfig: { assetId: bigint; name: string }[]): LendDataObject {
  const realPrincipals: Record<string, string> = {};
  const balances: Record<string, string> = {};

  for (const cfg of assetConfig) {
    // 원금
    const p = data.realPrincipals.get(cfg.assetId) ?? 0n;
    if (p !== 0n) {
      const decimals = ["USDT", "jUSDT"].includes(cfg.name) ? 6 : 9;
      realPrincipals[cfg.name] = formatWithDecimals(p, decimals);
    }

    // 이자 반영된 결과
    const bal = data.balances.get(cfg.assetId);
    if (bal && bal.amount !== 0n) {
      const decimals = ["USDT", "jUSDT"].includes(cfg.name) ? 6 : 9;
      balances[cfg.name] = formatWithDecimals(bal.amount, decimals);
    }
  }

  return {
    healthFactor: data.healthFactor,
    supplyBalance: data.supplyBalance,
    borrowBalance: data.borrowBalance,
    realPrincipals,
    balances,
  };
}

async function run() {
  console.log(await getLendDataObject());
}

run();
