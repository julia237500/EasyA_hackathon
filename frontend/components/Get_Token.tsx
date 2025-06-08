"use client";

import React, { useState } from "react";
import * as xrpl from "xrpl";





function GetToken() {
  const [standbySeed, setStandbySeed] = useState("");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace this with your actual getNet() logic or URL string
  function getNet() {
    return "wss://s.altnet.rippletest.net:51233"; // Example: testnet
  }

  async function getTokens() {
    if (!standbySeed) {
      setResults("Please enter a valid wallet seed.");
      return;
    }

    setLoading(true);
    setResults("");

    try {
      const standby_wallet = xrpl.Wallet.fromSeed(standbySeed);
      const net = getNet();
      const client = new xrpl.Client(net);

      let output = `Connecting to ${net}...`;
      setResults(output);

      await client.connect();
      output += "\nConnected. Getting NFTs...";
      setResults(output);

const request: xrpl.AccountNFTsRequest = {
  command: "account_nfts",          // use 'command' instead of 'method'
  account: standby_wallet.classicAddress,
};

const response = await client.request(request);


      const nfts = response.result.account_nfts || [];
      output += `\n\nFound ${nfts.length} NFTs.\n`;

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];
        output += `\nNFT ${i + 1}:\n`;
        output += `  TokenID: ${nft.NFTokenID}\n`;
        output += `  URI (hex): ${nft.URI}\n`;

        if (nft.URI) {
          try {
            const uriString = xrpl.convertHexToString(nft.URI);
            const metadata = JSON.parse(uriString);

            output += `  Decoded Metadata:\n`;
            output += `    Loan ID: ${metadata.loanId}\n`;
            output += `    Amount: ${metadata.amount}\n`;
            output += `    Currency: ${metadata.currency}\n`;
            output += `    Date: ${new Date(metadata.date).toLocaleString()}\n`;
            output += `    Credit Score Impact: ${metadata.creditScoreImpact}\n`;
            output += `    Bank ID: ${metadata.bankId}\n`;
            output += `    Token URL: ${metadata.tokenUrlField}\n`;
} catch (err) {
  if (err instanceof Error) {
    output += `  Error decoding metadata: ${err.message}\n`;
  } else {
    output += `  Error decoding metadata: ${String(err)}\n`;
  }
}

        } else {
          output += `  No URI metadata found.\n`;
        }
        setResults(output); // Update after each NFT for better UX
      }

      await client.disconnect();
} catch (error) {
  if (error instanceof Error) {
    setResults(`Error: ${error.message}`);
  } else {
    setResults(`Error: ${String(error)}`);
  }
}

    setLoading(false);
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>Get XRPL NFTs</h2>
      <label>
        Enter Wallet Seed:
        <input
          type="text"
          value={standbySeed}
          onChange={(e) => setStandbySeed(e.target.value)}
          style={{ width: "100%", marginTop: 8, marginBottom: 12 }}
          placeholder="Enter your XRPL wallet seed"
        />
      </label>

      <button onClick={getTokens} disabled={loading || !standbySeed}>
        {loading ? "Loading..." : "Get Tokens"}
      </button>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          marginTop: 20,
          padding: 10,
          border: "1px solid #ccc",
          height: 300,
          overflowY: "scroll",
          backgroundColor: "#f9f9f9",
        }}
      >
        {results}
      </pre>
    </div>
  );
}

export default GetToken;
