async function main() {
  const CreditLog = await ethers.getContractFactory("CreditLog");
  const creditLog = await CreditLog.deploy();

  await creditLog.deployed();
  console.log("CreditLog deployed to:", creditLog.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
