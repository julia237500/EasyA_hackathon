// src/components/WalletConnector.jsx
import React, { useState } from "react";
import { ethers } from "ethers";

const WalletConnector = () => {
  const [address, setAddress] = useState("");

  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    setAddress(userAddress);
  };

  return (
    <div>
      <button onClick={connect}>Connect Wallet</button>
      {address && <p>Connected: {address}</p>}
    </div>
  );
};

export default WalletConnector;
