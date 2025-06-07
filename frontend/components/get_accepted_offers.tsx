"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function GetAcceptedOffers() {
  const [receiveSeed, setReceiveSeed] = useState("")
  const [result, setResult] = useState("")

  const getAcceptedOffers = async () => {
    setResult("Connecting...")

    const xrpl = await import("xrpl")
    const receive_wallet = xrpl.Wallet.fromSeed(receiveSeed)
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")

    await client.connect()
    let results = `Connected to XRPL. Fetching NFTs for ${receive_wallet.classicAddress}...\n`

    try {
      const nftsResponse = await client.request({
        method: "account_nfts",
        account: receive_wallet.classicAddress,
      } as any) //  Fix TypeScript type issue here

      const nfts = (nftsResponse.result as any).account_nfts || [] //  Also fix by explicitly casting

      results += `Found ${nfts.length} NFT(s).\n`

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i]
        results += `\nNFT ${i + 1}:\n  TokenID: ${nft.NFTokenID}\n`

        try {
          const offersResponse = await client.request({
            method: "nft_sell_offers",
            nft_id: nft.NFTokenID,
          } as any) //  Fix again with cast

          const offers = (offersResponse.result as any).offers || []
          if (offers.length === 0) {
            results += "  No sell offers.\n"
          } else {
            results += `  ${offers.length} offer(s):\n`
            for (const offer of offers) {
              results += `    Offer ID: ${offer.nft_offer_index}\n`
              results += `    Owner: ${offer.owner}\n`
              results += `    Amount: ${offer.amount} drops\n`
              if (offer.destination)
                results += `    Destination: ${offer.destination}\n`
            }
          }
        } catch (err: any) {
          results += `  Error fetching offers: ${err.message}\n`
        }
      }
    } catch (err: any) {
      results += `Error fetching NFTs: ${err.message}\n`
    }

    await client.disconnect()
    setResult(results)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Get Accepted Offers</h2>
      <input
        type="text"
        placeholder="Receiver Seed"
        value={receiveSeed}
        onChange={(e) => setReceiveSeed(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <Button onClick={getAcceptedOffers}>Get Offers</Button>
      <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded overflow-x-auto max-h-[400px]">
        {result}
      </pre>
    </div>
  )
}
