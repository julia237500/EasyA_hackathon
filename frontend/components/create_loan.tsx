"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as xrpl from "xrpl"

export default function CreateLoanNFT() {
  const [senderSeed, setSenderSeed] = useState("")
  const [receiverSeed, setReceiverSeed] = useState("")
  const [standbySeed, setStandbySeed] = useState("")
  const [loanId, setLoanId] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [dueDate, setDueDate] = useState("")
  const [impact, setImpact] = useState("")
  const [bankId, setBankId] = useState("")
  const [tokenUrl, setTokenUrl] = useState("")
  const [result, setResult] = useState("")

  const getNet = () => "wss://s.altnet.rippletest.net:51233"

  const createLoan = async () => {
    try {
      const senderWallet = xrpl.Wallet.fromSeed(senderSeed)
      const receiverWallet = xrpl.Wallet.fromSeed(receiverSeed)
      const client = new xrpl.Client(getNet())

      let log = `Connecting to XRPL Testnet...`
      setResult(log)

      await client.connect()
      log += "\nConnected. Creating NFT..."
      setResult(log)

      const metadata = {
        sender: senderWallet.classicAddress,
        receiver: receiverWallet.classicAddress,
        amount,
        bank: bankId,
        dueDate: new Date(dueDate).toISOString(),
        currency
      }

      const uri = xrpl.convertStringToHex(JSON.stringify(metadata))

      const mintTx: xrpl.NFTokenMint = {
        TransactionType: "NFTokenMint",
        Account: senderWallet.classicAddress,
        URI: uri,
        Flags: 8, // tfTransferable
        NFTokenTaxon: 0
      }

      const mintResult = await client.submitAndWait(mintTx, { wallet: senderWallet })
      const meta = mintResult.result.meta as xrpl.TransactionMetadata

      const txResult = meta?.TransactionResult
      log += `\nMint Transaction result: ${txResult}`
      setResult(log)

      if (txResult === "tesSUCCESS") {
        const affectedNodes = meta.AffectedNodes
        let mintedTokenId: string | null = null

        for (const node of affectedNodes) {
          if ("CreatedNode" in node && node.CreatedNode.LedgerEntryType === "NFTokenPage") {
            const newFields = node.CreatedNode.NewFields as any
            const nftokens = newFields?.NFTokens as any[]

            if (Array.isArray(nftokens) && nftokens.length > 0) {
              mintedTokenId = nftokens[0]?.NFToken?.NFTokenID
              break
            }
          }
        }

        if (!mintedTokenId) {
          log += "\nError: Could not find minted NFTokenID."
          setResult(log)
          await client.disconnect()
          return
        }

  log += `\nMinted NFTokenID: ${mintedTokenId}`


        log += `\nMinted NFTokenID: ${mintedTokenId}`

        const offerTx: xrpl.NFTokenCreateOffer = {
          TransactionType: "NFTokenCreateOffer",
          Account: senderWallet.classicAddress,
          NFTokenID: mintedTokenId,
          Destination: receiverWallet.classicAddress,
          Amount: "0"
        }

        const offerResult = await client.submitAndWait(offerTx, { wallet: senderWallet })
        const offerMeta = offerResult.result.meta as xrpl.TransactionMetadata
        const offerTxResult = offerMeta?.TransactionResult

        log += `\nCreate Offer Transaction result: ${offerTxResult}`
      }

      const balance = await client.getXrpBalance(senderWallet.address)
      log += `\nUpdated Sender Balance: ${balance} XRP`

      setResult(log)
      await client.disconnect()
    } catch (err: any) {
      setResult("Error: " + err.message)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Create Loan NFT</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Sender Seed</Label>
          <Input value={senderSeed} onChange={(e) => setSenderSeed(e.target.value)} />
        </div>
        <div>
          <Label>Receiver Seed</Label>
          <Input value={receiverSeed} onChange={(e) => setReceiverSeed(e.target.value)} />
        </div>
        <div>
          <Label>Amount</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>Bank ID</Label>
          <Input value={bankId} onChange={(e) => setBankId(e.target.value)} />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <Label>Currency</Label>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
      </div>

      <Button onClick={createLoan}>Create Loan NFT</Button>

      {result && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm mt-4">
          {result}
        </div>
      )}
    </div>
  )
}
