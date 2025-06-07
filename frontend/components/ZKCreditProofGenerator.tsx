"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as xrpl from "xrpl"
import { ethers } from "ethers"

// --- EVM Sidechain Config ---
// Replace with your deployed contract address and ABI
const EVM_CONTRACT_ADDRESS = "0xYourContractAddressHere"
const EVM_CONTRACT_ABI = [
  // Minimal ABI for storing repayment hashes
  "function storeRepaymentHash(bytes32 hash) public",
  "event RepaymentHashStored(bytes32 hash)"
]
// Replace with your EVM Sidechain RPC URL (e.g., Ripple EVM sidechain testnet)
const EVM_RPC_URL = "https://rpc-evm-sidechain.xrpl.org" // Example, update as needed

// --- Mock Data ---
const mockLoans = [
  {
    loanId: "L-1001",
    amount: "10000",
    currency: "USD",
    date: "2024-01-01",
    creditScoreImpact: "5",
    bankId: "bank-1",
    tokenUrl: "https://example.com/loan/1001"
  },
  {
    loanId: "L-1002",
    amount: "5000",
    currency: "USD",
    date: "2024-02-01",
    creditScoreImpact: "3",
    bankId: "bank-2",
    tokenUrl: "https://example.com/loan/1002"
  }
]

const mockRepayments = [
  { loanId: "L-1001", amount: "1000", date: "2024-03-01" },
  { loanId: "L-1001", amount: "2000", date: "2024-04-01" },
  { loanId: "L-1002", amount: "500", date: "2024-03-15" }
]

type Block = {
  txHash: string
  loanId: string
  amount: string
  date: string
}

// --- XRPL Repayment Transaction ---
async function sendXRPLRepayment(seed: string, repayment: { loanId: string, amount: string, date: string }) {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  const wallet = xrpl.Wallet.fromSeed(seed)
  // Use a Payment tx as a stand-in for a repayment record
  const tx = await client.submitAndWait(
    {
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: wallet.classicAddress, // self-payment for demo
      Amount: xrpl.xrpToDrops("0.000001"), // minimal amount
      Memos: [
        {
          Memo: {
            MemoType: xrpl.convertStringToHex("Repayment"),
            MemoData: xrpl.convertStringToHex(JSON.stringify(repayment))
          }
        }
      ]
    },
    { wallet }
  )
  await client.disconnect()
  return tx.result.hash
}

// --- EVM Sidechain Storage ---
async function storeOnEVMSidechain(hash: string, evmPrivateKey: string) {
  const provider = new ethers.JsonRpcProvider(EVM_RPC_URL)
  const wallet = new ethers.Wallet(evmPrivateKey, provider)
  const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_CONTRACT_ABI, wallet)
  // Store the XRPL tx hash as bytes32 (truncate/pad as needed)
  const hashBytes32 = ethers.hexlify(ethers.zeroPadValue(hash, 32))
  const tx = await contract.storeRepaymentHash(hashBytes32)
  await tx.wait()
  return tx.hash
}

// --- ZK Proof Placeholder ---
async function generateZKProof(hashes: string[]) {
  // Placeholder: In real use, call a ZK circuit/prover
  return {
    proof: "0xZKPROOFFAKE",
    summary: `Proof of ${hashes.length} repayments`
  }
}

export default function CreateLoanNFT() {
  const [standbySeed, setStandbySeed] = useState("")
  const [evmPrivateKey, setEvmPrivateKey] = useState("")
  const [result, setResult] = useState("")
  const [zkResult, setZkResult] = useState<any>(null)

  // --- Mint Loan NFT (as before) ---
  const [loanId, setLoanId] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [date, setDate] = useState("")
  const [impact, setImpact] = useState("")
  const [bankId, setBankId] = useState("")
  const [tokenUrl, setTokenUrl] = useState("")

  const createToken = async () => {
    try {
      const standby_wallet = xrpl.Wallet.fromSeed(standbySeed)
      const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")

      let output = "Connecting to XRPL Testnet..."
      setResult(output)

      await client.connect()
      output += "\nConnected. Creating NFT..."

      // Create metadata
      const metadata = {
        loanId,
        amount,
        currency,
        date: new Date(date).toISOString(),
        creditScoreImpact: impact,
        bankId,
        tokenUrlField: tokenUrl,
      }

      const uri = xrpl.convertStringToHex(JSON.stringify(metadata))

      const tx = await client.submitAndWait(
        {
          TransactionType: "NFTokenMint",
          Account: standby_wallet.classicAddress,
          URI: uri,
          Flags: 8,
          NFTokenTaxon: 0,
        },
        { wallet: standby_wallet }
      )

      output += `\nTransaction result: ${(tx.result.meta as xrpl.TransactionMetadata).TransactionResult}`
      output += `\nNFT minted successfully.\nMetadata: ${JSON.stringify(metadata, null, 2)}`
      setResult(output)

      client.disconnect()
    } catch (err: any) {
      setResult("Error creating NFT: " + err.message)
    }
  }

  // --- Demo Flow ---
  const runFullDemo = async () => {
    setZkResult("Running demo...")
    try {
      // 1. XRPL repayments
      const hashes: string[] = []
      for (const repayment of mockRepayments) {
        const hash = await sendXRPLRepayment(standbySeed, repayment)
        hashes.push(hash)
      }
      // 2. Store hashes on EVM sidechain
      const evmTxHashes: string[] = []
      for (const hash of hashes) {
        const evmTxHash = await storeOnEVMSidechain(hash, evmPrivateKey)
        evmTxHashes.push(evmTxHash)
      }
      // 3. Generate ZK proof (placeholder)
      const zkProof = await generateZKProof(hashes)
      setZkResult({
        hashes,
        evmTxHashes,
        zkProof
      })
    } catch (err: any) {
      setZkResult("Error: " + err.message)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Create Loan NFT</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>XRPL Seed</Label>
          <Input value={standbySeed} onChange={(e) => setStandbySeed(e.target.value)} />
        </div>
        <div>
          <Label>EVM Private Key</Label>
          <Input value={evmPrivateKey} onChange={(e) => setEvmPrivateKey(e.target.value)} />
        </div>
        <div>
          <Label>Loan ID</Label>
          <Input value={loanId} onChange={(e) => setLoanId(e.target.value)} />
        </div>
        <div>
          <Label>Amount</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>Currency</Label>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Credit Score Impact</Label>
          <Input value={impact} onChange={(e) => setImpact(e.target.value)} />
        </div>
        <div>
          <Label>Bank ID</Label>
          <Input value={bankId} onChange={(e) => setBankId(e.target.value)} />
        </div>
        <div>
          <Label>Token URL</Label>
          <Input value={tokenUrl} onChange={(e) => setTokenUrl(e.target.value)} />
        </div>
      </div>

      <Button onClick={createToken}>Mint Loan NFT</Button>

      {result && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm mt-4">
          {result}
        </div>
      )}

      <hr className="my-8" />

      <h3 className="text-xl font-semibold">Demo: Repayments → XRPL → EVM → ZK Proof</h3>
      <Button onClick={runFullDemo} variant="secondary">Run Demo Flow</Button>
      {zkResult && typeof zkResult !== "string" && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm mt-4">
          <strong>XRPL Repayment Hashes:</strong>
          <pre>{JSON.stringify(zkResult.hashes, null, 2)}</pre>
          <strong>EVM Storage Tx Hashes:</strong>
          <pre>{JSON.stringify(zkResult.evmTxHashes, null, 2)}</pre>
          <strong>ZK Proof:</strong>
          <pre>{JSON.stringify(zkResult.zkProof, null, 2)}</pre>
        </div>
      )}
      {zkResult && typeof zkResult === "string" && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm mt-4">
          {zkResult}
        </div>
      )}
    </div>
  )
}