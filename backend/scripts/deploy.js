// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const LoanRegistry = await ethers.getContractFactory("LoanRegistry");
  
  // Deploy the contract
  console.log("Deploying LoanRegistry...");
  const loanRegistry = await LoanRegistry.deploy();
  
  // Wait for deployment to complete
  await loanRegistry.waitForDeployment();
  
  // Get the contract address
  const address = await loanRegistry.getAddress();
  
  console.log("LoanRegistry deployed to:", address);
}

// Proper error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });