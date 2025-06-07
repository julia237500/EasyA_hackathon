const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // Construct absolute path to the service file
    const servicePath = path.resolve(__dirname, 'src/services/xrpl-service.ts');

    // Check if the file exists
    if (!fs.existsSync(servicePath)) {
      console.error(`Error: File not found at ${servicePath}`);
      process.exit(1);
    }

    // Import the service module dynamically
    const { XRPLNFTService } = require(servicePath);

    if (!XRPLNFTService) {
      console.error('Error: XRPLNFTService export not found in the module');
      process.exit(1);
    }

    const service = new XRPLNFTService();

    // Connect and mint NFT
    await service.connect();
    const txHash = await service.mintCreditNFT({ test: 'data' });

    console.log('NFT Minted:', txHash);
  } catch (error) {
    console.error('Error during minting:', error);
  }
}

main();
