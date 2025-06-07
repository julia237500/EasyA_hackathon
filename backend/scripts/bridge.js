// scripts/bridge.js
const { AxelarAssetTransfer, Environment, CHAINS } = require("@axelar-network/axelarjs-sdk");
const { ethers } = require("ethers");

async function bridgeNFT(xrplTxHash, destinationAddress) {
  try {
    const transfer = new AxelarAssetTransfer({
      environment: Environment.TESTNET,
    });

    const depositAddress = await transfer.getDepositAddress({
      fromChain: "ethereum-sepolia",           // or your real source chain, lowercase
      toChain: "polygon-sepolia",              // target chain, lowercase
      destinationAddress: "0x03A695Bc8C7E2A94dee18745aAD7A4bB511362Fd",
      asset: "axlUSDC"               
    });

    console.log(`Deposit address: ${depositAddress}`);
  } catch (error) {
    console.error("Bridge error:", error);
  }
}

// Example usage
const xrplTxHash = "YOUR_XRPL_TX_HASH"; // Replace with actual XRPL transaction hash
const destinationAddress = "0xRECEIVER_ADDRESS"; // Replace with actual EVM address

bridgeNFT(xrplTxHash, destinationAddress)
  .then(() => console.log("Bridge process initiated"))
  .catch(console.error);