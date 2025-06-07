// src/services/credit-profile-service.ts
import { XRPLNFTService } from './xrpl-service';
import { AxelarBridgeService } from './axelar-service';
import { EvmChain } from './axelar-service';
import { ZKCreditService } from './zk-service';
import { ethers } from 'ethers';

export class CreditProfileService {
  private xrplService: XRPLNFTService;
  private axelarService: AxelarBridgeService;
  private zkService: ZKCreditService;
  private evmProvider: ethers.providers.JsonRpcProvider;
  private loanRegistryContract: ethers.Contract;

  constructor(
    xrplSeed: string,
    evmRpcUrl: string,
    loanRegistryAddress: string,
    loanRegistryAbi: any,
    zkWasmPath: string,
    zkZkeyPath: string,
    zkVkey: any
  ) {
    this.xrplService = new XRPLNFTService(xrplSeed);
    this.axelarService = new AxelarBridgeService();
    this.evmProvider = new ethers.providers.JsonRpcProvider(evmRpcUrl);
    this.loanRegistryContract = new ethers.Contract(
      loanRegistryAddress,
      loanRegistryAbi,
      this.evmProvider
    );
    this.zkService = new ZKCreditService(zkWasmPath, zkZkeyPath, zkVkey);
  }

  async initialize(): Promise<void> {
    await this.xrplService.connect();
  }

  async createCreditProfile(loanData: any): Promise<{
    xrplTxHash: string;
    evmLoanId: number;
  }> {
    // 1. Mint NFT on XRPL
    const xrplTxHash = await this.xrplService.mintCreditNFT(loanData);

    // 2. Bridge NFT to EVM (simplified - in reality would use Axelar's GMP)
    // This is where you'd use Axelar's deposit address service
      EvmChain.ETHEREUM, // Source chain (replace with actual value if needed)
      EvmChain.POLYGON, // Destination chain (replace with actual value if needed)
      this.loanRegistryContract.address,
      'NFT-' + xrplTxHash
      'NFT-' + xrplTxHash

    // 3. Register loan on EVM sidechain
    const signer = this.evmProvider.getSigner();
    const contractWithSigner = this.loanRegistryContract.connect(signer);
    
    const tx = await contractWithSigner.registerLoan(
      loanData.lender,
      loanData.amount,
      loanData.interestRate,
      loanData.term,
      0, // NFT ID would be set after bridging
      xrplTxHash
    );

    const receipt = await tx.wait();
    const loanId = receipt.events[0].args.loanId.toNumber();

    return { xrplTxHash, evmLoanId: loanId };
  }

  async recordPayment(loanId: number, amount: number): Promise<void> {
    const signer = this.evmProvider.getSigner();
    const contractWithSigner = this.loanRegistryContract.connect(signer);
    
    await contractWithSigner.recordPayment(loanId, amount);
  }

  async generateCreditProof(loanId: number): Promise<any> {
    // Get loan data from EVM
    const loan = await this.loanRegistryContract.loans(loanId);
    const payments = await this.loanRegistryContract.getLoanPayments(loanId);

    // Calculate credit metrics
    const onTimePayments = payments.filter(p => 
      p.timestamp <= (loan.startDate + loan.term) && p.verified
    ).length;

    const latePayments = payments.filter(p => 
      p.timestamp > (loan.startDate + loan.term) && p.verified
    ).length;

    const creditUtilization = 0.5; // Simplified calculation

    // Generate ZK proof
    return this.zkService.generateCreditProof({
      totalLoans: 1, // For this single loan
      onTimePayments,
      latePayments,
      creditUtilization
    });
  }
}