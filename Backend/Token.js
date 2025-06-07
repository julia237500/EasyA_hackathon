async function getTokens() {
  const send_wallet = xrpl.Wallet.fromSeed(sendSeedField.value)
  const receive_wallet = xrpl.Wallet.fromSeed(receiveSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  sendResultField.value = results
  receiveResultField.value = results

  await client.connect()
  results += '\nConnected.'

  // Function to get NFT info for a wallet
  async function getNftInfo(wallet, label) {
    let output = `\n\n NFTs for ${label} (${wallet.classicAddress}):\n`

    try {
      const nftsResponse = await client.request({
        method: "account_nfts",
        account: wallet.classicAddress
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
            
            //  Show sender address if it exists in metadata
            if (metadata.senderAddress) {
              output += `    Sender Address: ${metadata.senderAddress}\n`
            }

          } catch (err) {
            output += `  Error decoding metadata: ${err.message}\n`
          }
        } else {
          output += `  No URI metadata found.\n`
        }
      }
    } catch (err) {
      output += `\nError fetching NFTs: ${err.message}`
    }

    return output
  }

  const senderInfo = await getNftInfo(send_wallet, 'Sender')
  const receiverInfo = await getNftInfo(receive_wallet, 'Receiver')

  sendResultField.value = results + senderInfo
  receiveResultField.value = results + receiverInfo

  client.disconnect()
}







async function burnToken() {
  // Sender burns token owned by sender
  const send_wallet = xrpl.Wallet.fromSeed(sendSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  sendResultField.value = results
  await client.connect()
  results += '\nConnected. Burning NFT...'
  sendResultField.value = results

  const transactionBlob = {
    "TransactionType": "NFTokenBurn",
    "Account": send_wallet.classicAddress,
    "NFTokenID": sendTokenIdField.value
  }

  const tx = await client.submitAndWait(transactionBlob, { wallet: send_wallet })

  const nftsResponse = await client.request({
    method: "account_nfts",
    account: send_wallet.classicAddress
  })

  results += '\nTransaction result: ' + tx.result.meta.TransactionResult
  results += '\nBalance changes: ' + JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  results += '\nNFTs: \n' + JSON.stringify(nftsResponse.result.account_nfts, null, 2)

  sendResultField.value = results
  sendBalanceField.value = await client.getXrpBalance(send_wallet.address)

  client.disconnect()
}










async function createLoanNFT() {
  const send_wallet = xrpl.Wallet.fromSeed(sendSeedField.value)
  const receive_wallet = xrpl.Wallet.fromSeed(receiveSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  sendResultField.value = results

  await client.connect()
  results += '\nConnected. Creating NFT...'
  sendResultField.value = results

  // Compose loan metadata using form field values
  const metadata = {
    sender: send_wallet.classicAddress,
    receiver: receive_wallet.classicAddress,
    amount: amountField.value,
    bank: bankIdField.value,
    dueDate: new Date(dateField.value).toISOString(),
    currency: currencyField.value
  }

  const uri = xrpl.convertStringToHex(JSON.stringify(metadata))

  // Mint NFT transaction blob
  const mintTx = {
    TransactionType: "NFTokenMint",
    Account: send_wallet.classicAddress,
    URI: uri,
    Flags: 8, // tfTransferable
    NFTokenTaxon: 0
  }

  // Submit mint transaction
  const mintResult = await client.submitAndWait(mintTx, { wallet: send_wallet })

  results += '\nMint Transaction result: ' + mintResult.result.meta.TransactionResult
  sendResultField.value = results

  if (mintResult.result.meta.TransactionResult === "tesSUCCESS") {
    const affectedNodes = mintResult.result.meta.AffectedNodes
    let mintedTokenId = null

    for (const node of affectedNodes) {
      if (node.CreatedNode && node.CreatedNode.LedgerEntryType === "NFTokenPage") {
        const newFields = node.CreatedNode.NewFields
        if (newFields && newFields.NFTokens && newFields.NFTokens.length > 0) {
          mintedTokenId = newFields.NFTokens[0].NFToken.NFTokenID
          break
        }
      }
    }

    if (!mintedTokenId) {
      results += '\nError: Could not find minted NFTokenID.'
      sendResultField.value = results
      await client.disconnect()
      return
    }

    results += `\nMinted NFTokenID: ${mintedTokenId}`

    // Transfer NFT to receiver
    const transferTx = {
      TransactionType: "NFTokenTransfer",
      Account: send_wallet.classicAddress,
      Destination: receive_wallet.classicAddress,
      NFTokenID: mintedTokenId
    }

    const transferResult = await client.submitAndWait(transferTx, { wallet: send_wallet })

    results += '\nTransfer Transaction result: ' + transferResult.result.meta.TransactionResult
    sendResultField.value = results
  }

  sendBalanceField.value = await client.getXrpBalance(send_wallet.address)

  await client.disconnect()
}











async function createOffer() {
  const send_wallet = xrpl.Wallet.fromSeed(sendSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  sendResultField.value = results

  await client.connect()
  results += '\nConnected. Minting NFT...'
  sendResultField.value = results

  // Step 1: Create (Mint) the NFT
  const metadata = {
    loanId: loanIdField.value,
    amount: amountField.value,
    currency: currencyField.value,
    date: new Date(dateField.value).toISOString(),
    creditScoreImpact: impactField.value,
    bankId: bankIdField.value,
    tokenUrlField: tokenUrlField.value
  }

  const uri = xrpl.convertStringToHex(JSON.stringify(metadata))

  const mintTx = {
    "TransactionType": "NFTokenMint",
    "Account": send_wallet.classicAddress,
    "URI": uri,
    "Flags": 8, // Transferable
    "NFTokenTaxon": 0
  }

  const mintResponse = await client.submitAndWait(mintTx, { wallet: send_wallet })

  results += '\nMint result: ' + mintResponse.result.meta.TransactionResult

  // Step 2: Fetch newly minted Token ID
  const nftsResponse = await client.request({
    method: "account_nfts",
    account: send_wallet.classicAddress
  })

  const nfts = nftsResponse.result.account_nfts
  const newestNft = nfts[nfts.length - 1] // assume latest minted is last in array
  const tokenId = newestNft.NFTokenID

  results += '\nMinted Token ID: ' + tokenId
  results += '\nCreating NFT Offer...'
  sendResultField.value = results

  // Step 3: Create NFT Offer
  const offerTx = {
    TransactionType: "NFTokenCreateOffer",
    Account: send_wallet.classicAddress,
    NFTokenID: tokenId,
    Destination: receiveAddressField.value,
    Flags: 0 // Transfer without sale
  }

  try {
    const offerResponse = await client.submitAndWait(offerTx, { wallet: send_wallet })
    results += '\nOffer result: ' + offerResponse.result.meta.TransactionResult
    results += '\nBalance changes:\n' + JSON.stringify(xrpl.getBalanceChanges(offerResponse.result.meta), null, 2)
    sendResultField.value = results
  } catch (err) {
    results += '\nError creating offer: ' + err.message
    sendResultField.value = results
  }

  client.disconnect()
}


async function acceptOffer() {
  // Receiver accepts NFT offer sent to them
  const receive_wallet = xrpl.Wallet.fromSeed(receiveSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  receiveResultField.value = results

  await client.connect()
  results += '\nConnected. Accepting NFT Offer...'
  receiveResultField.value = results

  const transactionBlob = {
    TransactionType: "NFTokenAcceptOffer",
    Account: receive_wallet.classicAddress,
    OfferID: offerIdField.value
  }

  try {
    const tx = await client.submitAndWait(transactionBlob, { wallet: receive_wallet })
    results += '\nTransaction result: ' + tx.result.meta.TransactionResult
    results += '\nBalance changes:\n' + JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
    receiveResultField.value = results
  } catch (err) {
    results += '\nError accepting offer: ' + err.message
    receiveResultField.value = results
  }

  client.disconnect()
}

async function getOffers() {
  // Receiver gets offers for specific NFT token id
  const receive_wallet = xrpl.Wallet.fromSeed(receiveSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  receiveResultField.value = results

  await client.connect()
  results += '\nConnected. Getting NFT Offers...'
  receiveResultField.value = results

  try {
    const offers = await client.request({
      method: "nft_sell_offers",
      nft_id: receiveTokenIdField.value
    })

    results += '\nOffers:\n' + JSON.stringify(offers.result, null, 2)
    receiveResultField.value = results
  } catch (err) {
    results += '\nError getting offers: ' + err.message
    receiveResultField.value = results
  }

  client.disconnect()
}

async function getAcceptedOffers() {
  // Receiver fetches NFTs owned by them and the sell offers for each NFT
  const receive_wallet = xrpl.Wallet.fromSeed(receiveSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  receiveResultField.value = results

  await client.connect()
  results += '\nConnected. Fetching accepted NFTs and their offers...'
  receiveResultField.value = results

  try {
    const nftsResponse = await client.request({
      method: "account_nfts",
      account: receive_wallet.classicAddress
    })

    const nfts = nftsResponse.result.account_nfts
    results += `\nFound ${nfts.length} NFTs owned by account.\n`

    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      results += `\nNFT ${i + 1} - TokenID: ${nft.NFTokenID}\n`

      try {
        const offersResponse = await client.request({
          method: "nft_sell_offers",
          nft_id: nft.NFTokenID
        })

        const offers = offersResponse.result.offers || []
        if (offers.length === 0) {
          results += "  No sell offers for this NFT.\n"
        } else {
          results += `  Found ${offers.length} sell offer(s):\n`
          for (let j = 0; j < offers.length; j++) {
            const offer = offers[j]
            results += `    Offer ${j + 1}:\n`
            results += `      Seller: ${offer.Seller}\n`
            results += `      Amount (drops): ${offer.Amount}\n`
            results += `      Flags: ${offer.Flags}\n`
            results += `      Owner: ${offer.Owner}\n`
          }
        }
      } catch (offerErr) {
        results += `  Error fetching offers for NFT: ${offerErr.message}\n`
      }
    }
  } catch (err) {
    results += '\nError fetching NFTs or offers: ' + err.message
  }

  receiveResultField.value = results
  client.disconnect()
}



async function getUnacceptedOffers() {
  // Receiver gets all unaccepted offers sent to them (Destination = receiver)
  const receive_wallet = xrpl.Wallet.fromSeed(receiveSeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  receiveResultField.value = results

  await client.connect()
  results += '\nConnected. Getting unaccepted NFT offers sent to this account...'
  receiveResultField.value = results

  try {
    // Step 1: Get all NFTs owned by receiver
    const nftsResponse = await client.request({
      method: "account_nfts",
      account: receive_wallet.classicAddress
    })

    const nfts = nftsResponse.result.account_nfts
    if (nfts.length === 0) {
      results += '\nNo NFTs owned by this account, so no offers to accept.'
      receiveResultField.value = results
      await client.disconnect()
      return
    }

    results += `\nFound ${nfts.length} NFTs owned by account.`

    // Step 2: For each NFT, get all sell offers and filter those targeted to this account
    let totalOffersFound = 0
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]

      results += `\n\nNFT ${i + 1} - TokenID: ${nft.NFTokenID}`

      try {
        const offersResponse = await client.request({
          method: "nft_sell_offers",
          nft_id: nft.NFTokenID
        })

        const offers = offersResponse.result.offers || []

        // Filter offers where Destination matches receiver address
        const offersToReceiver = offers.filter(o => o.Destination === receive_wallet.classicAddress)

        if (offersToReceiver.length === 0) {
          results += `\n  No unaccepted offers sent to this account for this NFT.`
        } else {
          results += `\n  Found ${offersToReceiver.length} unaccepted offer(s) sent to this account:`
          totalOffersFound += offersToReceiver.length
          for (let j = 0; j < offersToReceiver.length; j++) {
            const offer = offersToReceiver[j]
            results += `\n    Offer ${j + 1}:`
            results += `\n      Offer ID: ${offer.nft_offer_index}`
            results += `\n      Seller: ${offer.Seller}`
            results += `\n      Amount (drops): ${offer.Amount}`
            results += `\n      Flags: ${offer.Flags}`
            results += `\n      Owner: ${offer.Owner}`
          }
        }
      } catch (offerErr) {
        results += `\n  Error fetching offers for NFT: ${offerErr.message}`
      }
    }

    if (totalOffersFound === 0) {
      results += `\n\nNo unaccepted offers sent to this account were found across all NFTs.`
    }
  } catch (err) {
    results += '\nError fetching NFTs or offers: ' + err.message
  }

  receiveResultField.value = results
  client.disconnect()
}








module.exports = {
  getTokens,
  burnToken,
  createToken,
  createOffer,
  acceptOffer,
  getOffers,
  getAcceptedOffers,
  getUnacceptedOffers
}
