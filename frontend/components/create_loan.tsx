"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import * as xrpl from "xrpl"

export default function CreateLoanNFT() {
  const [sendSeed, setSendSeed] = useState("")
  const [receiveSeed, setReceiveSeed] = useState("")
  const [sendResult, setSendResult] = useState("")
  const [receiveResult, setReceiveResult] = useState("")

  const getNet = () => "wss://s.altnet.rippletest.net:51233"

  const getTokens = async () => {
    try {
      const send_wallet = xrpl.Wallet.fromSeed(sendSeed)
      const receive_wallet = xrpl.Wallet.fromSeed(receiveSeed)
      const net = getNet()
      const client = new xrpl.Client(net)

      let results = "Connecting to " + net + "..."
      setSendResult(results)
      setReceiveResult(results)

      await client.connect()
      results += "\nConnected."

      async function getNftInfo(wallet: xrpl.Wallet, label: string) {
        let output = `\n\nNFTs for ${label} (${wallet.classicAddress}):\n`

        try {
          const nftsResponse = await client.request({
            method: "account_nfts",
            account: wallet.classicAddress,
          })

          const nfts = nftsResponse.result.account_nfts
          output += `Found ${nfts.length} NFTs.\n`

          for (let i = 0; i < nfts.length; i++) {
            const nft = nfts[i]
            output += `\nNFT ${i + 1}:\n`
            output += `  TokenID: ${nft.NFTokenID}\n`
            output += `  URI (hex): ${nft.URI}\n`

            if (nft.URI) {
              try {
                const uriString = xrpl.convertHexToString(nft.URI)
                const metadata = JSON.parse(uriString)

                output += `  Decoded Metadata:\n`
                output += `    Loan ID: ${metadata.loanId}\n`
                output += `    Amount: ${metadata.amount}\n`
                output += `    Currency: ${metadata.currency}\n`
                output += `    Date: ${new Date(metadata.date).toLocaleString()}\n`
                output += `    Bank ID: ${metadata.bankId}\n`
                output += `    Token URL: ${metadata.tokenUrlField}\n`

                if (metadata.senderAddress) {
                  output += `    Sender Address: ${metadata.senderAddress}\n`
                }
              } catch (err: any) {
                output += `  Error decoding metadata: ${err.message}\n`
              }
            } else {
              output += `  No URI metadata found.\n`
            }
          }
        } catch (err: any) {
          output += `\nError fetching NFTs: ${err.message}`
        }

        return output
      }

      const senderInfo = await getNftInfo(send_wallet, "Sender")
      const receiverInfo = await getNftInfo(receive_wallet, "Receiver")

      setSendResult(results + senderInfo)
      setReceiveResult(results + receiverInfo)

      await client.disconnect()
    } catch (err: any) {
      setSendResult("Error: " + err.message)
      setReceiveResult("Error: " + err.message)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Check Loan NFTs</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Sender Seed</Label>
          <Input value={sendSeed} onChange={(e) => setSendSeed(e.target.value)} />
        </div>
        <div>
          <Label>Receiver Seed</Label>
          <Input value={receiveSeed} onChange={(e) => setReceiveSeed(e.target.value)} />
        </div>
      </div>

      <Button onClick={getTokens}>Get Tokens</Button>

      {sendResult && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm mt-4">
          <h4 className="font-semibold">Sender NFTs</h4>
          {sendResult}
        </div>
      )}
      {receiveResult && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm mt-4">
          <h4 className="font-semibold">Receiver NFTs</h4>
          {receiveResult}
        </div>
      )}
    </div>
  )
}
