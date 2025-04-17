import { SendTransactionRequest, TonConnect, Wallet } from "@tonconnect/sdk";
import FileStorage from "./fileStorage";
import * as QRCode from "qrcode";
import { Address, Cell } from "@ton/ton";

interface WalletConnectionSource {
  universalLink: string;
  bridgeUrl: string;
}

interface TxParam {
  to: Address;
  value: bigint;
  body?: Cell | null | undefined;
}

export class Walletconnector {
  private connector: TonConnect;
  private connectedWallet: Wallet | null = null;

  constructor(manifestUrl: string, storageFile: string = "tonconnect-temp") {
    this.connector = new TonConnect({
      manifestUrl,
      storage: new FileStorage(storageFile),
    });
    this.connectedWallet = null;
  }

  private async waitForConnection(): Promise<Wallet> {
    return new Promise((resolve) => {
      const checkConnection = (wallet: Wallet | null) => {
        if (wallet) {
          console.log("✅ Connected to wallet:", wallet.device.appName);
          console.log("🔹 Wallet Address:", wallet.account.address.toString());
          this.connectedWallet = wallet;
          resolve(wallet);
        }
      };

      const currentWallet = this.connector.wallet;
      if (currentWallet) {
        checkConnection(currentWallet);
      } else {
        this.connector.onStatusChange(checkConnection);
      }
    });
  }

  public async connect(walletSource: WalletConnectionSource): Promise<Wallet> {
    await this.connector.restoreConnection();

    if (!this.connector.connected) {
      const universalLink = this.connector.connect(walletSource);
      console.log(await QRCode.toString(universalLink!!, { type: "terminal", small: true }));
      console.log("🔗 Universal Link:", universalLink);
      return await this.waitForConnection();
    } else {
      return await this.waitForConnection();
    }
  }

  public async sendTx(messages: TxParam) {
    this.connector.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: messages.to.toString(),
          amount: messages.value.toString(),
          payload: messages.body?.toBoc().toString("base64"),
        },
      ],
    });
  }

  public async getAvailableWallets(): Promise<void> {
    const wallets = await this.connector.getWallets();
    wallets.forEach((wallet) => {
      console.log("🔹 Available Wallet:", wallet.name);
    });
  }

  public getAddress(): string | undefined {
    return this.connector.account?.address;
  }

  public isConnected(): boolean {
    return this.connector.connected;
  }

  public onStatusChange(callback: (wallet: Wallet | null) => void): () => void {
    return this.connector.onStatusChange(callback);
  }

  public disconnect = () => {
    this.connector.disconnect();
  };

  public sender = () => {
    return { send: (param: TxParam) => this.sendTx(param) };
  };
}
