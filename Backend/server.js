const express = require('express');
const fetch = require('node-fetch'); 
const app = express();
app.use(express.json()); 

const PORT = process.env.PORT || 3001;

const { getTokens, burnToken, createToken } = require('./Token.js')
app.post('/Token', async (req, res) => {
  try {
    await createToken()
    res.send('NFT minted successfully!')
  } catch (err) {
    res.status(500).send('Error minting NFT: ' + err.message)
  }
})


app.post('/api/get-link-token', async (req, res) => {
  const client_id = process.env.FINVERSE_CLIENT_ID;
  const client_secret = process.env.FINVERSE_CLIENT_SECRET;
  const customer_app_id = process.env.FINVERSE_CUSTOMER_APP_ID;

  try {
    // Step 1: Get customer token
    const tokenRes = await fetch("https://api.prod.finverse.net/auth/customer/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id,
        client_secret,
        grant_type: "client_credentials",
      }),
    });x`x`

    if (!tokenRes.ok) {
      throw new Error(`Token request failed: ${tokenRes.statusText}`);
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Get link token
    const linkRes = await fetch("https://api.prod.finverse.net/link/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,    
      },
      body: JSON.stringify({
        customer_app_id,
        redirect_uri: "https://your-app.com/redirect", // Whitelisted URI
        ui_mode: "redirect",
      }),
    });

    if (!linkRes.ok) {
      throw new Error(`Link token request failed: ${linkRes.statusText}`);
    }

    const linkData = await linkRes.json();

    res.status(200).json(linkData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});


const xrpl = require('xrpl');

async function connectToXRPL() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233'); // Use testnet
  await client.connect();
  return client;
}





let loans = []; // Store loans in-memory (use DB in real app)
let loanIdCounter = 1;

// Step 1: Create a loan request, approvalCount = 0
app.post('/api/create-loan', (req, res) => {
  const { borrower1, borrower2, amount } = req.body;

  if (!borrower1 || !borrower2 || !amount) {
    return res.status(400).json({ error: "borrower1, borrower2, and amount are required" });
  }

  const loan = {
    id: loanIdCounter++,
    borrowers: [borrower1, borrower2],
    amount,
    approvalStatus: { [borrower1]: false, [borrower2]: false },
    status: 'pending', // pending until both approve
  };

  loans.push(loan);
  res.status(201).json({ message: 'Loan created', loan });
});

// Step 2: Approve loan by a borrower
app.post('/api/approve-loan', (req, res) => {
  const { loanId, borrower } = req.body;

  const loan = loans.find(l => l.id === loanId);
  if (!loan) return res.status(404).json({ error: "Loan not found" });

  if (!loan.borrowers.includes(borrower)) {
    return res.status(403).json({ error: "Borrower not authorized to approve this loan" });
  }

  loan.approvalStatus[borrower] = true;

  // Check if both approved
  if (Object.values(loan.approvalStatus).every(status => status)) {
    loan.status = 'approved';
  }

  res.json({ message: 'Approval recorded', loan });
});

// Step 3: Get loan status
app.get('/api/loan/:id', (req, res) => {
  const loan = loans.find(l => l.id === parseInt(req.params.id));
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  res.json(loan);
});





// Add this endpoint to server.js to mint NFT on XRPL using data from the client
const express = require('express');
const xrpl = require('xrpl');



app.post('/api/mint-nft', async (req, res) => {
  const { seed, loanId, amount, currency, tokenUrl } = req.body;

  if (!seed || !loanId || !amount || !currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    const wallet = xrpl.Wallet.fromSeed(seed);

    const repaymentNFT = {
      loanId,
      amount: parseFloat(amount),
      currency,
      date: Date.now(),
      tokenUrlField: tokenUrl || ''
    };

    const metadataJson = JSON.stringify(repaymentNFT);
    const uriHex = xrpl.convertStringToHex(metadataJson);

    const transactionJson = {
      TransactionType: "NFTokenMint",
      Account: wallet.classicAddress,
      URI: uriHex,
      Flags: 1,              // Use default flag
      TransferFee: 0,        // Default no fee
      NFTokenTaxon: 0
    };

    const tx = await client.submitAndWait(transactionJson, { wallet });

    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress
    });

    const balance = await client.getXrpBalance(wallet.address);

    await client.disconnect();

    res.json({
      message: 'NFT minted successfully',
      transactionResult: tx.result.meta.TransactionResult,
      nfts: nfts.result.account_nfts,
      balance
    });
  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({ error: error.message || 'Minting failed' });
  }
});

module.exports = app;







app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
