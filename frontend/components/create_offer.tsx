"use client";

import { useState } from "react";
import * as xrpl from "xrpl";

export default function CreateOffer() {
  const [seed, setSeed] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [date, setDate] = useState("");
  const [impact, setImpact] = useState("");
  const [bankId, setBankId] = useState("");
  const [tokenUrl, setTokenUrl] = useState("");
  const [result, setResult] = useState("");

  const handleCreateOffer = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    try {
      setResult("Connecting to XRPL...");
      await client.connect();

      const wallet = xrpl.Wallet.fromSeed(seed);

      const metadata = {
        loanId,
        amount,
        currency,
        date: new Date(date).toISOString(),
        creditScoreImpact: impact,
        bankId,
        tokenUrlField: tokenUrl
      };

      const uri = xrpl.convertStringToHex(JSON.stringify(metadata));

      const mintTx: xrpl.NFTokenMint = {
        TransactionType: "NFTokenMint",
        Account: wallet.classicAddress,
        URI: uri,
        Flags: 8,
        NFTokenTaxon: 0
      };

      setResult("Minting NFT...");
      const mintResponse = await client.submitAndWait(mintTx, { wallet });

      const meta = mintResponse.result?.meta as xrpl.TransactionMetadata;
      if (meta?.TransactionResult !== "tesSUCCESS") {
        throw new Error("Minting failed");
      }

      const nftsResponse = await client.request({
        command: "account_nfts",
        account: wallet.classicAddress
      });

      const nfts = (nftsResponse as any).result.account_nfts;
      if (!nfts || nfts.length === 0) {
        throw new Error("No NFTs found after minting");
      }

      const newestNft = nfts[nfts.length - 1];
      const tokenId = newestNft.NFTokenID;

      setResult(`NFT Minted. Token ID: ${tokenId}\nCreating Offer...`);

      const offerTx: xrpl.NFTokenCreateOffer = {
        TransactionType: "NFTokenCreateOffer",
        Account: wallet.classicAddress,
        NFTokenID: tokenId,
        Destination: recipientAddress,
        Amount: "0", // For transfer only offer (no sale)
        Flags: 1 // Indicates a sell offer
      };

      const offerResponse = await client.submitAndWait(offerTx, { wallet });
      const offerMeta = offerResponse.result?.meta as xrpl.TransactionMetadata;

      if (offerMeta?.TransactionResult !== "tesSUCCESS") {
        throw new Error("Offer creation failed");
      }

      setResult(
        `Offer created successfully.\nToken ID: ${tokenId}\nTransaction Result: ${offerMeta.TransactionResult}`
      );
    } catch (err: any) {
      setResult("Error: " + (err?.message || String(err)));
    } finally {
      client.disconnect();
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <input placeholder="Sender Wallet Seed" value={seed} onChange={e => setSeed(e.target.value)} className="input" />
      <input placeholder="Recipient Address" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} className="input" />
      <input placeholder="Loan ID" value={loanId} onChange={e => setLoanId(e.target.value)} className="input" />
      <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="input" />
      <input placeholder="Currency" value={currency} onChange={e => setCurrency(e.target.value)} className="input" />
      <input placeholder="Date" type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
      <input placeholder="Credit Score Impact" value={impact} onChange={e => setImpact(e.target.value)} className="input" />
      <input placeholder="Bank ID" value={bankId} onChange={e => setBankId(e.target.value)} className="input" />
      <input placeholder="Token URL" value={tokenUrl} onChange={e => setTokenUrl(e.target.value)} className="input" />
      <button onClick={handleCreateOffer} className="btn">Create & Offer NFT</button>
      <div className="result whitespace-pre-wrap p-2 bg-gray-100 rounded text-sm">{result}</div>
    </div>
  );
}
