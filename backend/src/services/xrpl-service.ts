// src/services/xrpl-service.ts
import { Client, Wallet, NFTokenMint, convertStringToHex } from 'xrpl';

export class XRPLNFTService {
  private client: Client;
  private wallet: Wallet;
  private devnetUrl = 'wss://s.devnet.rippletest.net:51233';

  constructor(walletSeed?: string) {
    this.client = new Client(this.devnetUrl);
    this.wallet = walletSeed ? Wallet.fromSeed(walletSeed) : Wallet.generate();
  }

  async connect(): Promise<void> {
    await this.client.connect();
    await this.fundWalletIfNeeded();
  }

  private async fundWalletIfNeeded(): Promise<void> {
    const balance = await this.client.getXrpBalance(this.wallet.address);
    if (balance < 10) {
      await this.client.fundWallet(this.wallet);
    }
  }

  async mintCreditNFT(loanData: any): Promise<string> {
    const nftTx: NFTokenMint = {
      TransactionType: 'NFTokenMint',
      Account: this.wallet.address,
      NFTokenTaxon: 0, // Required field
      URI: convertStringToHex(JSON.stringify(loanData)),
      Flags: 8 // Set the tfTransferable flag
    };

    const prepared = await this.client.autofill(nftTx);
    const signed = this.wallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);
    
    return result.result.hash;
  }

  async getNFTs(account: string): Promise<any[]> {
    const response = await this.client.request({
      command: 'account_nfts',
      account: account
    });
    return response.result.account_nfts;
  }
}