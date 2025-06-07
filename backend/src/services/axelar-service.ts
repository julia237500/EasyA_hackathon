// src/services/axelar-service.ts
import { AxelarQueryAPI, Environment, EvmChain } from "@axelar-network/axelarjs-sdk";
export { AxelarQueryAPI, Environment, EvmChain } from "@axelar-network/axelarjs-sdk";

export class AxelarBridgeService {
  private api: AxelarQueryAPI;
  private environment: Environment;

  constructor(environment: Environment = Environment.TESTNET) {
    this.environment = environment;
    this.api = new AxelarQueryAPI({ environment });
  }

  async estimateBridgeFee(
    sourceChain: EvmChain,
    destinationChain: EvmChain,
    tokenSymbol: string
  ): Promise<bigint> {
    // Provide a default amount, e.g., 1
    const response = await this.api.getTransferFee(
      sourceChain,
      destinationChain,
      tokenSymbol,
      1 // amountInDenom
    );
    // Assuming the response.fee is an object with 'amount' and 'denom' properties
    return BigInt(response.fee.amount);
  }

async getDepositAddress(
    sourceChain: EvmChain,
    destinationChain: EvmChain,
    destinationAddress: string,
    asset: string
    ): Promise<string> {
    // Temporary workaround using internal method
    return await (this.api as any).getDepositAddressFromAPI(
        sourceChain,
        destinationChain,
        destinationAddress,
        asset
    );
}
}