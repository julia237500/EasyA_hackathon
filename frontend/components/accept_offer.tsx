"use client";
import { useState } from "react";

export default function AcceptOffer() {
  const [seed, setSeed] = useState("");
  const [address, setAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [result, setResult] = useState("");

  const handleAcceptOffer = async () => {
    // Placeholder logic for accepting an offer
    const response = `Offer accepted for Token ${tokenId} by ${address}`;
    setResult(response);
  };

  return (
    <div className="space-y-4">
      <input placeholder="Receiver Wallet Seed" value={seed} onChange={e => setSeed(e.target.value)} className="input" />
      <input placeholder="Receiver Wallet Address" value={address} onChange={e => setAddress(e.target.value)} className="input" />
      <input placeholder="NFT Token ID" value={tokenId} onChange={e => setTokenId(e.target.value)} className="input" />
      <button onClick={handleAcceptOffer} className="btn">Accept Offer</button>
      <div className="result">{result}</div>
    </div>
  );
}
