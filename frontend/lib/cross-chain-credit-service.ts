// lib/cross-chain-credit-service.ts
import { Client, Wallet, NFTokenMint, isValidAddress, AccountTxResponse } from 'xrpl';
import { ethers } from 'ethers';
import { AxelarQueryAPI, Environment } from "@axelar-network/axelarjs-sdk";
import { v4 as uuidv4 } from 'uuid';
import { generateCreditProof } from './zk-credit-proof'; // Mock ZK generator

// Types
type LoanNFT = {
  nftId: string;
  loanId: string;
  borrower: string;
  lender: string;
  amount: number;
  currency: string;
  mintedAt: number;
  xrplTxHash: string;
};

type LoanRecord = {
  loanId: string;
  nftId: string;
  borrower: string;
  lender: string;
  amount: number;
  currency: string;
  interestRate: number;
  termLength: number;
  loanType: string;
  status: 'active' | 'paid' | 'defaulted';
  createdAt: number;
  evmTxHash: string;
};

type PaymentRecord = {
  paymentId: string;
  loanId: string;
  amount: number;
  currency: string;
  timestamp: number;
  verified: boolean;
  evmTxHash: string;
};

type CreditProof = {
  proofId: string;
  timestamp: number;
  creditScore: number;
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    creditAge: number;
    creditMix: number;
    newCredit: number;
  };
  zkProof: string;
  verifiedLoans: string[];
};

export class CrossChainCreditService {
  private xrplClient: Client;
  private evmProvider: ethers.providers.JsonRpcProvider;
  private axelarApi: AxelarQueryAPI;
  private userWallet: Wallet;
  private nftIssuerWallet: Wallet;

  // EVM contract ABIs (simplified for prototype)
  private loanRegistryAbi = [
    "function registerLoan(string memory loanId, string memory nftId, address borrower, address lender, uint256 amount, string memory currency, uint256 interestRate, uint256 termLength, string memory loanType) external",
    "function recordPayment(string memory paymentId, string memory loanId, uint256 amount, string memory currency, uint256 timestamp) external",
    "function getLoan(string memory loanId) external view returns (tuple(string,string,address,address,uint256,string,uint256,uint256,string,string,uint256))",
    "function getLoanPayments(string memory loanId) external view returns (tuple(string,string,uint256,string,uint256,bool,string)[] memory)"
  ];

  constructor(
    xrplUserSeed: string,
    xrplIssuerSeed: string,
    evmRpcUrl: string,
    evmContractAddress: string
  ) {
    // Initialize XRPL client
    this.xrplClient = new Client('wss://s.devnet.rippletest.net:51233');
    
    // Initialize EVM provider
    this.evmProvider = new ethers.providers.JsonRpcProvider(evmRpcUrl);
    
    // Initialize Axelar API
    this.axelarApi = new AxelarQueryAPI({ environment: Environment.TESTNET });
    
    // Initialize wallets
    this.userWallet = Wallet.fromSeed(xrplUserSeed);
    this.nftIssuerWallet = Wallet.fromSeed(xrplIssuerSeed);
    
    // Initialize EVM contract
    this.loanRegistryContract = new ethers.Contract(
      evmContractAddress,
      this.loanRegistryAbi,
      this.evmProvider.getSigner()
    );
  }

  async connect(): Promise<void> {
    try {
      await this.xrplClient.connect();
      console.log('Connected to XRPL DevNet');
      
      // Check balances
      await this.checkBalances();
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  private async checkBalances(): Promise<void> {
    const userBalance = await this.getXrplAccountBalance(this.userWallet.address);
    const issuerBalance = await this.getXrplAccountBalance(this.nftIssuerWallet.address);
    
    console.log(`User balance: ${userBalance} XRP`);
    console.log(`Issuer balance: ${issuerBalance} XRP`);
    
    if (parseFloat(userBalance) < 10) {
      await this.fundXrplAccount(this.userWallet.address);
    }
    
    if (parseFloat(issuerBalance) < 10) {
      await this.fundXrplAccount(this.nftIssuerWallet.address);
    }
  }

  private async fundXrplAccount(address: string): Promise<void> {
    try {
      await this.xrplClient.fundWallet(null, { address });
      console.log(`Funded account ${address}`);
    } catch (error) {
      console.error(`Failed to fund account ${address}:`, error);
    }
  }

  async createLoanNFT(loanData: {
    loanId: string;
    borrower: string;
    lender: string;
    amount: number;
    currency: string;
    metadata: Record<string, any>;
  }): Promise<LoanNFT> {
    // Validate addresses
    if (!isValidAddress(loanData.borrower) || !isValidAddress(loanData.lender)) {
      throw new Error('Invalid XRPL addresses');
    }

    // Prepare NFT metadata
    const metadata = {
      ...loanData.metadata,
      loanId: loanData.loanId,
      borrower: loanData.borrower,
      lender: loanData.lender,
      amount: loanData.amount,
      currency: loanData.currency,
      timestamp: Date.now()
    };

    const nftTx: NFTokenMint = {
      TransactionType: 'NFTokenMint',
      Account: this.nftIssuerWallet.address,
      NFTokenTaxon: 0, // Required by the protocol
      URI: Buffer.from(JSON.stringify(metadata)).toString('hex'),
      Flags: {
        tfTransferable: true,
        tfOnlyXRP: false,
        tfTrustLine: false
      },
      Memos: [
        {
          Memo: {
            MemoType: Buffer.from('loan', 'utf8').toString('hex'),
            MemoData: Buffer.from(loanData.loanId, 'utf8').toString('hex')
          }
        }
      ]
    };

    try {
      const prepared = await this.xrplClient.autofill(nftTx);
      const signed = this.nftIssuerWallet.sign(prepared);
      const result = await this.xrplClient.submitAndWait(signed.tx_blob);
      
      const nftId = result.result.meta?.nftoken_id;
      if (!nftId) throw new Error('NFT ID not found in transaction result');
      
      const nft: LoanNFT = {
        nftId,
        loanId: loanData.loanId,
        borrower: loanData.borrower,
        lender: loanData.lender,
        amount: loanData.amount,
        currency: loanData.currency,
        mintedAt: Date.now(),
        xrplTxHash: result.result.hash
      };

      return nft;
    } catch (error) {
      console.error('Error minting loan NFT:', error);
      throw new Error(`Failed to mint loan NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async registerLoanOnEVM(loan: {
    loanId: string;
    nftId: string;
    borrower: string;
    lender: string;
    amount: number;
    currency: string;
    interestRate: number;
    termLength: number;
    loanType: string;
  }): Promise<string> {
    try {
      // Convert addresses to EVM format if needed
      const borrowerEvm = this.convertXrplToEvmAddress(loan.borrower);
      const lenderEvm = this.convertXrplToEvmAddress(loan.lender);
      
      const tx = await this.loanRegistryContract.registerLoan(
        loan.loanId,
        loan.nftId,
        borrowerEvm,
        lenderEvm,
        ethers.utils.parseUnits(loan.amount.toString(), 18), // Assuming 18 decimals
        loan.currency,
        loan.interestRate,
        loan.termLength,
        loan.loanType
      );
      
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error registering loan on EVM:', error);
      throw new Error(`Failed to register loan: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async recordPaymentOnEVM(payment: {
    paymentId: string;
    loanId: string;
    amount: number;
    currency: string;
    timestamp?: number;
  }): Promise<string> {
    try {
      const tx = await this.loanRegistryContract.recordPayment(
        payment.paymentId,
        payment.loanId,
        ethers.utils.parseUnits(payment.amount.toString(), 18),
        payment.currency,
        payment.timestamp || Math.floor(Date.now() / 1000)
      );
      
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error recording payment on EVM:', error);
      throw new Error(`Failed to record payment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getLoanDetails(loanId: string): Promise<{
    loan: LoanRecord;
    payments: PaymentRecord[];
    nft?: LoanNFT;
  }> {
    try {
      // Get loan from EVM
      const evmLoan = await this.loanRegistryContract.getLoan(loanId);
      const evmPayments = await this.loanRegistryContract.getLoanPayments(loanId);
      
      // Try to find NFT on XRPL
      let nft: LoanNFT | undefined;
      try {
        nft = await this.findLoanNFT(loanId);
      } catch (err) {
        console.warn('Could not find loan NFT:', err);
      }
      
      // Format loan record
      const loan: LoanRecord = {
        loanId: evmLoan.loanId,
        nftId: evmLoan.nftId,
        borrower: this.convertEvmToXrplAddress(evmLoan.borrower),
        lender: this.convertEvmToXrplAddress(evmLoan.lender),
        amount: parseFloat(ethers.utils.formatUnits(evmLoan.amount, 18)),
        currency: evmLoan.currency,
        interestRate: parseFloat(evmLoan.interestRate.toString()),
        termLength: parseFloat(evmLoan.termLength.toString()),
        loanType: evmLoan.loanType,
        status: evmLoan.status,
        createdAt: parseFloat(evmLoan.createdAt.toString()) * 1000,
        evmTxHash: evmLoan.evmTxHash
      };
      
      // Format payments
      const payments: PaymentRecord[] = evmPayments.map((p: any) => ({
        paymentId: p.paymentId,
        loanId: p.loanId,
        amount: parseFloat(ethers.utils.formatUnits(p.amount, 18)),
        currency: p.currency,
        timestamp: parseFloat(p.timestamp.toString()) * 1000,
        verified: p.verified,
        evmTxHash: p.evmTxHash
      }));
      
      return { loan, payments, nft };
    } catch (error) {
      console.error('Error fetching loan details:', error);
      throw new Error(`Failed to get loan details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async findLoanNFT(loanId: string): Promise<LoanNFT> {
    // Search for NFT with the loan ID in memos
    const transactions = await this.xrplClient.request({
      command: 'account_tx',
      account: this.nftIssuerWallet.address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 100
    });
    
    const nftTx = transactions.result.transactions?.find((tx: any) => {
      return tx.tx?.Memos?.some((memo: any) => 
        Buffer.from(memo.Memo.MemoData, 'hex').toString('utf8') === loanId
      );
    });
    
    if (!nftTx) throw new Error('NFT not found');
    
    const nftId = nftTx.meta?.nftoken_id;
    if (!nftId) throw new Error('NFT ID not found in transaction');
    
    const uri = nftTx.tx?.URI;
    const metadata = uri ? JSON.parse(Buffer.from(uri, 'hex').toString('utf8')) : {};
    
    return {
      nftId,
      loanId,
      borrower: metadata.borrower,
      lender: metadata.lender,
      amount: metadata.amount,
      currency: metadata.currency,
      mintedAt: metadata.timestamp,
      xrplTxHash: nftTx.tx?.hash
    };
  }

  async generateCreditProof(borrowerAddress: string): Promise<CreditProof> {
    try {
      // Get all loans for this borrower from EVM
      // Note: This would require additional contract methods to query by borrower
      // For prototype, we'll use mock data
      
      // In a real implementation:
      // 1. Query EVM for all loans belonging to this borrower
      // 2. For each loan, get payment history
      // 3. Calculate credit metrics
      // 4. Generate ZK proof
      
      // Mock implementation
      return await generateCreditProof(borrowerAddress);
    } catch (error) {
      console.error('Error generating credit proof:', error);
      throw new Error(`Failed to generate credit proof: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Utility functions for address conversion between XRPL and EVM
  private convertXrplToEvmAddress(xrplAddress: string): string {
    // Simple conversion for prototype
    // In production, you'd want a more robust method
    const clean = xrplAddress.replace(/^r/, '0x');
    return clean.length === 42 ? clean : `0x${'0'.repeat(40)}`;
  }

  private convertEvmToXrplAddress(evmAddress: string): string {
    // Simple conversion for prototype
    return `r${evmAddress.replace(/^0x/, '').padEnd(34, '0')}`;
  }

  async getXrplAccountBalance(address: string): Promise<string> {
    try {
      const response = await this.xrplClient.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });
      
      const balance = parseInt(response.result.account_data.Balance) / 1000000;
      return balance.toFixed(6);
    } catch (error) {
      console.error('Error fetching XRPL balance:', error);
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.xrplClient.disconnect();
      console.log('Disconnected from XRPL');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }
}