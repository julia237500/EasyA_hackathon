// components/get_unaccepted_tokens.tsx
"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as xrpl from "xrpl"

export default function GetUnacceptedTokens() {
  const [result, setResult] = useState("")
  const [sendSeed, setSendSeed] = useState("")

  async function getTokens() {
    if (!sendSeed) {
      setResult("Please enter a seed.")
      return
    }

    try {
      const send_wallet = xrpl.Wallet.fromSeed(sendSeed)
      const net = "wss://s.altnet.rippletest.net:51233" // or your configured network
      const client = new xrpl.Client(net)

      let results = 'Connecting to ' + net + '...'
      setResult(results)

      await client.connect()
      results += '\nConnected. Getting NFTs...'
      setResult(results)

      const nftsResponse = await client.request({
        command: "account_nfts",
        account: send_wallet.classicAddress
        }
      )

        const nfts = (nftsResponse.result as { account_nfts: xrpl.AccountNFToken[] }).account_nfts
      results += '\n\nFound ' + nfts.length + ' NFTs.\n'

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i]
        results += `\nNFT ${i + 1}:\n`
        results += `  TokenID: ${nft.NFTokenID}\n`
        results += `  URI (hex): ${nft.URI}\n`

        if (nft.URI) {
          try {
            const uriString = xrpl.convertHexToString(nft.URI)
            const metadata = JSON.parse(uriString)

            // Only show unaccepted offers (i.e., if not metadata.accepted or similar flag)
            if (!metadata.accepted) {
              results += `  Decoded Metadata:\n`
              results += `    Loan ID: ${metadata.loanId}\n`
              results += `    Amount: ${metadata.amount}\n`
              results += `    Currency: ${metadata.currency}\n`
              results += `    Date: ${new Date(metadata.date).toLocaleString()}\n`
              results += `    Credit Score Impact: ${metadata.creditScoreImpact}\n`
              results += `    Bank ID: ${metadata.bankId}\n`
              results += `    Token URL: ${metadata.tokenUrlField}\n`
            }
                    } 
                    
                    catch (err: unknown) {
            if (err instanceof Error) {
                results += `  Error decoding metadata: ${err.message}\n`
            } else {
                results += `  Error decoding metadata: ${String(err)}\n`
            }
            }

        } else {
          results += `  No URI metadata found.\n`
        }
      }

      setResult(results)
      await client.disconnect()
    } catch (e: any) {
      setResult("Error: " + e.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Unaccepted Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="password"
          placeholder="Enter wallet seed"
          className="w-full p-2 border rounded"
          value={sendSeed}
          onChange={(e) => setSendSeed(e.target.value)}
        />
        <Button onClick={getTokens}>Get Tokens</Button>
        <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded max-h-[500px] overflow-auto">
          {result}
        </pre>
      </CardContent>
    </Card>
  )
}
