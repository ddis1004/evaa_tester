import { Address, beginCell, Cell, toNano, WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import { useClient, useEvaa } from "./hooks";
import { Walletconnector } from "./walletConnector";
import {
  ASSET_ID,
  FEES,
  JUSDC_TESTNET,
  JUSDT_TESTNET,
  MAINNET_LP_POOL_CONFIG,
  MAINNET_POOL_CONFIG,
  PricesCollector,
  STTON_TESTNET,
  TESTNET_POOL_CONFIG,
  TON_MAINNET,
  TON_TESTNET,
  TONUSDT_DEDUST_MAINNET,
  USDT_MAINNET,
} from "@evaafi/sdk";

async function run() {
  const client = useClient();
  if (!client) throw new Error("TonClient could not be initialized");
  const evaa = useEvaa(client);

  const wallet = new Walletconnector(
    "https://raw.githubusercontent.com/ddis1004/jetton-image-test/refs/heads/main/tonconnect.json",
    "tonconnect-temp"
  );
  await wallet.connect({
    universalLink: "https://app.tonkeeper.com/ton-connect",
    bridgeUrl: "https://bridge.tonapi.io/bridge",
  });

  await evaa.getSync();
  console.log(MAINNET_POOL_CONFIG);
  const priceCollector = new PricesCollector(TESTNET_POOL_CONFIG);
  const priceData = await priceCollector.getPrices();

  const amount = BigInt(30000000);
  await evaa.sendWithdraw(wallet.sender(), FEES.WITHDRAW, {
    queryID: BigInt(0),
    includeUserCode: false,
    asset: JUSDT_TESTNET,
    priceData: priceData!.dataCell,
    amount: amount,
    userAddress: Address.parse(process.env.ADDRESS_1!!),
    amountToTransfer: toNano(0),
    payload: Cell.EMPTY,
  });

  // // await wallet.disconnect();
}

run();
