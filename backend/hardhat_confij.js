require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); //load from .env file

module.exports = {
  solidity: "0.8.20",
  networks: {
    xrplEvm: {
      url: "https://rpc-evm-sidechain.xrpl.org",
      chainId: 1440002,
      accounts: [process.env.PRIVATE_KEY] //safely loaded
    }
  }
};

