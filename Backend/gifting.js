
// *******************************************************
// ******************** Gift NFT *************************
// *******************************************************

async function giftNFT() {
  const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
  let net = getNet()
  const client = new xrpl.Client(net)
  let results = 'Connecting to ' + net + '...'
  standbyResultField.value = results

  await client.connect()
  results += '\nConnected. Creating gift offer...'
  standbyResultField.value = results

  // Validate destination
  const recipient = standbyDestinationField.value
  if (!xrpl.isValidClassicAddress(recipient)) {
    standbyResultField.value = "Invalid recipient address."
    client.disconnect()
    return
  }

  // Optional expiration
  let expirationDate = null
  if (standbyExpirationField.value !== "") {
    const days = parseInt(standbyExpirationField.value)
    const d = new Date()
    d.setDate(d.getDate() + days)
    expirationDate = xrpl.isoTimeToRippleTime(d)
  }

  // Create a 0-XRP sell offer (gift)
  const transactionBlob = {
    TransactionType: "NFTokenCreateOffer",
    Account: standby_wallet.classicAddress,
    NFTokenID: standbyTokenIdField.value,
    Amount: "0",
    Flags: 1, // tfSellNFToken
    Destination: recipient
  }

  if (expirationDate !== null) {
    transactionBlob.Expiration = expirationDate
  }

  // Submit offer
  const tx = await client.submitAndWait(transactionBlob, { wallet: standby_wallet })
  results += "\nTransaction result: " + tx.result.meta.TransactionResult

  // Show the offer index (optional for recipient to accept manually)
  const offerId = tx.result.tx_json.OfferID
  results += '\nGift OfferID: ' + offerId

  // Confirm updated offers
  let nftSellOffers, nftBuyOffers
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      nft_id: standbyTokenIdField.value
    })
    results += '\n\n***Sell Offers***\n' + JSON.stringify(nftSellOffers, null, 2)
  } catch {
    results += '\n\nNo sell offers.'
  }

  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      nft_id: standbyTokenIdField.value
    })
    results += '\n\n***Buy Offers***\n' + JSON.stringify(nftBuyOffers, null, 2)
  } catch {
    results += '\n\nNo buy offers.'
  }

  standbyBalanceField.value = await client.getXrpBalance(standby_wallet.address)
  standbyResultField.value = results
  client.disconnect()
}
