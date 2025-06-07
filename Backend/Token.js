async function getTokens() {
  const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  standbyResultField.value = results

  await client.connect()
  results += '\nConnected. Getting NFTs...'
  standbyResultField.value = results

  const nfts = await client.request({
    method: "account_nfts",
    account: standby_wallet.classicAddress
  })

  //const nftsRes = nftResponse.result.account_nfts

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

        results += `  Decoded Metadata:\n`
        results += `    Loan ID: ${metadata.loanId}\n`
        results += `    Amount: ${metadata.amount}\n`
        results += `    Currency: ${metadata.currency}\n`
        results += `    Date: ${new Date(metadata.date).toLocaleString()}\n`
        results += `    Credit Score Impact: ${metadata.creditScoreImpact}\n`
        results += `    Bank ID: ${metadata.bankId}\n`
        results += `    Token URL: ${metadata.tokenUrlField}\n`
      } catch (err) {
        results += `  Error decoding metadata: ${err.message}\n`
      }
    } else {
      results += `  No URI metadata found.\n`
    }
  }

  standbyResultField.value = results

  client.disconnect()
}

async function burnToken() {
  const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
  let net = getNet()
  const client = new xrpl.Client(net)
  results = 'Connecting to ' + net + '...'
  standbyResultField.value = results
  await client.connect()
  results += '\nConnected. Burning NFT...'
  standbyResultField.value = results

  // ------------------------------------------------------- Prepare transaction
  const transactionBlob = {
    "TransactionType": "NFTokenBurn",
    "Account": standby_wallet.classicAddress,
    "NFTokenID": standbyTokenIdField.value
  }

  //---------------------------------- Submit transaction and wait for the results
  const tx = await client.submitAndWait(transactionBlob,{wallet: standby_wallet})
  const nfts = await client.request({
    method: "account_nfts",
    account: standby_wallet.classicAddress
  })
  results += '\nTransaction result: '+ tx.result.meta.TransactionResult
  results += '\nBalance changes: ' +
  JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  standbyResultField.value = results
  standbyBalanceField.value = (await client.getXrpBalance(standby_wallet.address))
  results += '\nNFTs: \n' + JSON.stringify(nfts,null,2)
  standbyResultField.value = results
  client.disconnect()
}// End of burnToken()


async function createToken() {
  const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
  const net = getNet()
  const client = new xrpl.Client(net)

  let results = 'Connecting to ' + net + '...'
  standbyResultField.value = results

  await client.connect()
  results += '\nConnected. Creating NFT...'
  standbyResultField.value = results

  // Construct metadata JSON object
  const metadata = {
    loanId: loanIdField.value,
    amount: amountField.value,
    currency: currencyField.value,
    date: new Date(dateField.value).toISOString(),
    creditScoreImpact: impactField.value,
    bankId: bankIdField.value,
    tokenUrlField: tokenUrlField.value
  }

  // Convert JSON to string and encode as hex for URI
  const uri = xrpl.convertStringToHex(JSON.stringify(metadata))

  // Prepare mint transaction
  const transactionBlob = {
    "TransactionType": "NFTokenMint",
    "Account": standby_wallet.classicAddress,
    "URI": uri,
    "Flags": 8, // Transferable
    "NFTokenTaxon": 0
  }

  // Submit transaction
  const tx = await client.submitAndWait(transactionBlob, { wallet: standby_wallet })

  results += '\nTransaction result: ' + tx.result.meta.TransactionResult
  results += '\nBalance changes:\n' +
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)

  standbyResultField.value = results
  standbyBalanceField.value = await client.getXrpBalance(standby_wallet.address)

  client.disconnect()
}



module.exports = {
  getTokens,
  burnToken,
  createToken
}