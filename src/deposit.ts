import { Address, beginCell, Cell, toNano } from "@ton/ton";
import { useClient, useEvaa } from "./hooks";
import { Walletconnector } from "./walletConnector";
import { ASSET_ID, TON_TESTNET, FEES, JUSDT_TESTNET } from "@evaafi/sdk";
import { configDotenv } from "dotenv";

async function run() {
  configDotenv();
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

  const amount = toNano(15);

  await evaa.sendSupply({ send: (param) => wallet.sendTx(param) }, FEES.SUPPLY + amount, {
    queryID: BigInt(0),
    userAddress: Address.parse(process.env.ADDRESS_2!!),
    includeUserCode: true,
    amountToTransfer: toNano(0),
    amount: amount,
    asset: TON_TESTNET,
    payload: Cell.EMPTY,
  });
}

run();
