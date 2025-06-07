// src/services/zk-service.ts
const snarkjs = require('snarkjs');  
import { buildBn128 } from 'wasmsnark';
import { BigNumber } from 'ethers';

export class ZKCreditService {
  private wasmPath: string;
  private zkeyPath: string;
  private vkey: any;

  constructor(wasmPath: string, zkeyPath: string, vkey: any) {
    this.wasmPath = wasmPath;
    this.zkeyPath = zkeyPath;
    this.vkey = vkey;
  }

  async generateCreditProof(creditData: {
    totalLoans: number;
    onTimePayments: number;
    latePayments: number;
    creditUtilization: number;
  }): Promise<{
    proof: any;
    publicSignals: any;
  }> {
    const input = {
      totalLoans: creditData.totalLoans.toString(),
      onTimePayments: creditData.onTimePayments.toString(),
      latePayments: creditData.latePayments.toString(),
      creditUtilization: Math.floor(creditData.creditUtilization * 100).toString()
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      this.wasmPath,
      this.zkeyPath
    );

    return { proof, publicSignals };
  }

  async verifyCreditProof(proof: any, publicSignals: any): Promise<boolean> {
    return await snarkjs.groth16.verify(this.vkey, publicSignals, proof);
  }

  async generateSolidityCalldata(proof: any, publicSignals: any): Promise<string> {
    const rawCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    return rawCallData;
  }
}