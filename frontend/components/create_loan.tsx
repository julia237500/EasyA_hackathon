"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import * as xrpl from "xrpl"

export default function CreateLoanNFT() {
  const [standbySeed, setStandbySeed] = useState("")
  const [loanId, setLoanId] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [date, setDate] = useState("")
  const [impact, setImpact] = useState("")
  const [bankId, setBankId] = useState("")
  const [tokenUrl, setTokenUrl] = useState("")
  const [result, setResult] = useState("")

  const getNet = () => "wss://s.altnet.rippletest.net:51233"

  const createToken = async () => {
    try {
      const standby_wallet = xrpl.Wallet.fromSeed(standbySeed)
      const client = new xrpl.Client(getNet())

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

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Create Loan NFT</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Seed</Label>
          <Input value={standbySeed} onChange={(e) => setStandbySeed(e.target.value)} />
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
    </div>
  )
}
