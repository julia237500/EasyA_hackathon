"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import * as xrpl from "xrpl"
import { ethers } from "ethers"
import { groth16 } from "snarkjs"

// Configuration
const XRPL_TESTNET = "wss://s.altnet.rippletest.net:51233"
const EVM_SIDECHAIN_RPC = "https://rpc.evm-sidechain.example" // Replace with actual RPC
const BRIDGE_CONTRACT_ADDRESS = "0x123...abc" // Replace with actual bridge contract

export default function XRPL2EVMSystem() {
  // State for UI
  const [xrplSeed, setXrplSeed] = useState("")
  const [evmPrivateKey, setEvmPrivateKey] = useState("")
  const [loanAmount, setLoanAmount] = useState("1000")
  const [repaymentAmount, setRepaymentAmount] = useState("")
  const [loanId, setLoanId] = useState("")
  const [status, setStatus] = useState("")
  const [zkProof, setZkProof] = useState<any>(null)
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [actionLog, setActionLog] = useState<string[]>([])

  // Add a message to the action log
  const logAction = (message: string) => {
    setActionLog(prev => [...prev, message])
    setStatus(message)
  }

  // Create a loan NFT on XRPL
  const createXRPLLoan = async () => {
    try {
      logAction("Connecting to XRPL Testnet...")
      const wallet = xrpl.Wallet.fromSeed(xrplSeed)
      const client = new xrpl.Client(XRPL_TESTNET)
      await client.connect()

      logAction("Creating loan NFT...")
      const loanDetails = {
        amount: loanAmount,
        currency: "USD",
        borrower: wallet.classicAddress,
        dueDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days from now
      }

      const tx = await client.submitAndWait({
        TransactionType: "NFTokenMint",
        Account: wallet.classicAddress,
        URI: xrpl.convertStringToHex(JSON.stringify(loanDetails)),
        Flags: 8, // Transferable
        NFTokenTaxon: 0
      }, { wallet })

      const nftId = tx.result.meta?.nftoken_id
      if (!nftId) throw new Error("NFT creation failed")

      setLoanId(nftId)
      logAction(`Loan NFT created on XRPL: ${nftId}`)
      client.disconnect()
    } catch (err: any) {
      logAction(`Error: ${err.message}`)
    }
  }

  // Bridge loan to EVM sidechain
  const bridgeToEVM = async () => {
    try {
      if (!loanId) throw new Error("No loan to bridge")
      
      logAction("Initializing bridge...")
      const provider = new ethers.providers.JsonRpcProvider(EVM_SIDECHAIN_RPC)
      const signer = new ethers.Wallet(evmPrivateKey, provider)
      
      // Mock bridge contract ABI
      const bridgeABI = [
        "function depositNFT(string calldata nftId, uint256 amount) external",
        "function getBridgedNFT(string calldata xrplNftId) external view returns (uint256)"
      ]
      
      const bridge = new ethers.Contract(BRIDGE_CONTRACT_ADDRESS, bridgeABI, signer)
      
      logAction("Locking NFT on XRPL...")
      // In a real implementation, you would:
      // 1. Send the XRPL NFT to the bridge's XRPL address
      // 2. Wait for bridge confirmation
      // 3. Mint wrapped NFT on EVM side
      
      // For demo, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      logAction("NFT bridged to EVM sidechain")
    } catch (err: any) {
      logAction(`Error: ${err.message}`)
    }
  }

  // Make repayment on EVM sidechain
  const makeRepayment = async () => {
    try {
      if (!repaymentAmount || !loanId) throw new Error("Invalid repayment details")
      
      logAction("Processing repayment...")
      const provider = new ethers.providers.JsonRpcProvider(EVM_SIDECHAIN_RPC)
      const signer = new ethers.Wallet(evmPrivateKey, provider)
      
      // Mock loan contract ABI
      const loanABI = [
        "function makePayment(uint256 loanId, uint256 amount) external",
        "function getLoanDetails(uint256 loanId) external view returns (uint256, uint256, uint256, bool)"
      ]
      
      // For demo, we'll use a mock contract address
      const loanContract = new ethers.Contract("0xloan...contract", loanABI, signer)
      
      // Simulate repayment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      logAction(`Repayment of ${repaymentAmount} processed`)
    } catch (err: any) {
      logAction(`Error: ${err.message}`)
    }
  }

  // Generate ZK proof of repayment performance
  const generateZKProof = async () => {
    try {
      logAction("Generating ZK proof...")
      
      // In a real implementation, you would:
      // 1. Fetch repayment history from the EVM sidechain
      // 2. Generate witness data
      // 3. Use snarkjs to generate proof
      
      // Mock proof generation
      const mockProof = {
        a: ["0x123", "0x456"],
        b: [["0x789", "0x012"], ["0x345", "0x678"]],
        c: ["0x901", "0x234"],
        publicSignals: {
          totalRepaid: repaymentAmount,
          onTime: true,
          creditScore: 750
        }
      }
      
      setZkProof(mockProof)
      logAction("ZK proof generated")
      
      // Verify proof
      await verifyZKProof(mockProof)
    } catch (err: any) {
      logAction(`Error: ${err.message}`)
    }
  }

  // Verify ZK proof
  const verifyZKProof = async (proof: any) => {
    try {
      logAction("Verifying ZK proof...")
      
      // In a real implementation, you would:
      // 1. Load verification key
      // 2. Call groth16.verify
      
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      setVerificationResult(true)
      logAction("ZK proof verified successfully")
    } catch (err: any) {
      logAction(`Verification failed: ${err.message}`)
      setVerificationResult(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Loan Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>XRPL Seed</Label>
            <Input
              type="password"
              value={xrplSeed}
              onChange={(e) => setXrplSeed(e.target.value)}
              placeholder="s..."
            />
          </div>

          <div className="space-y-2">
            <Label>EVM Private Key</Label>
            <Input
              type="password"
              value={evmPrivateKey}
              onChange={(e) => setEvmPrivateKey(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="space-y-2">
            <Label>Loan Amount (USD)</Label>
            <Input
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>

          <Button onClick={createXRPLLoan} className="w-full">
            Create Loan on XRPL
          </Button>

          {loanId && (
            <>
              <div className="space-y-2">
                <Label>Loan ID</Label>
                <Input value={loanId} readOnly />
              </div>

              <Button onClick={bridgeToEVM} className="w-full">
                Bridge to EVM Sidechain
              </Button>

              <div className="space-y-2">
                <Label>Repayment Amount (USD)</Label>
                <Input
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                />
              </div>

              <Button onClick={makeRepayment} className="w-full">
                Make Repayment
              </Button>

              <Button onClick={generateZKProof} className="w-full">
                Generate ZK Proof
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status & Proof</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="p-2 rounded bg-muted">{status || "Idle"}</div>
          </div>

          {zkProof && (
            <>
              <div className="space-y-2">
                <Label>ZK Proof</Label>
                <div className="p-2 rounded bg-muted text-xs font-mono overflow-x-auto">
                  {JSON.stringify(zkProof, null, 2)}
                </div>
              </div>

              {verificationResult !== null && (
                <Badge variant={verificationResult ? "success" : "destructive"}>
                  {verificationResult ? "Proof Verified" : "Proof Invalid"}
                </Badge>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>Action Log</Label>
            <div className="h-48 overflow-y-auto p-2 rounded bg-muted text-sm">
              {actionLog.map((log, i) => (
                <div key={i} className="py-1 border-b">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}