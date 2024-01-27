import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [lockStatus, setLockStatus] = useState(false);
  const [pin, setPin] = useState(6346); // Default pin
  const [inputPin, setInputPin] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm && inputPin === pin.toString()) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    } else {
      alert("Incorrect PIN");
    }
  }

  const withdraw = async() => {
    if (atm && inputPin === pin.toString()) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    } else {
      alert("Incorrect PIN");
    }
  }

  const toggleLock = async () => {
    if (atm) {
      await atm.toggleLock();
      setLockStatus(!lockStatus);
    }
  }

  const changePin = async (newPin) => {
    if (atm) {
      await atm.changePin(newPin);
      setPin(newPin);
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>Owner Name: Sunil KS</p>
        <p>Country: India</p>
        <p>Date of Birth: 20 Jan 2002</p>
        <input
          type="text"
          placeholder="Enter PIN"
          value={inputPin}
          onChange={(e) => setInputPin(e.target.value)}
        />
        <button style={{backgroundColor: "red"}} onClick={deposit}>Deposit 1 ETH</button>
        <button style={{backgroundColor: "green"}} onClick={withdraw}>Withdraw 1 ETH</button>
        <button style={{backgroundColor: "blue"}} onClick={toggleLock}>{lockStatus ? "Unlock Contract" : "Lock Contract"}</button>
        <button style={{backgroundColor: "purple"}} onClick={() => changePin(5434)}>Change PIN to 5434</button>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container" style={{backgroundColor: "yellow"}}>
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
