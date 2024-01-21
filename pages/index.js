import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [notification, setNotification] = useState({ message: "", visible: false });
  const [language, setLanguage] = useState("english"); 
  const [amount, setAmount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
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

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(amount);
        await tx.wait();
        getBalance();
        showNotification(`Deposit successful, Amount: ${amount} ETH`, true, "Deposit");
      } catch (error) {
        console.error("Deposit error:", error);
        showNotification("Deposit failed", false, "Deposit");
      }
    }
  }

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(amount);
        await tx.wait();
        getBalance();
        showNotification(`Withdrawal successful, Amount: ${amount} ETH`, true, "Withdrawal");
      } catch (error) {
        console.error("Withdrawal error:", error);
        showNotification("Withdrawal failed", false, "Withdrawal");
      }
    }
  }

  const switchLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  }

  const showNotification = (message, success, type) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

    setNotification({ message: `${message} - ${formattedDate}`, success, type, visible: true });

    // Hide the notification after a few seconds
    setTimeout(() => {
      setNotification({ message: "", success: false, type: "", visible: false });
    }, 5000);
  }

  const renderLanguageButtons = () => {
    return (
      <div>
        <button onClick={() => switchLanguage("hindi")}>हिंदी में</button>
        <button onClick={() => switchLanguage("tamil")}>தமிழில்</button>
        <button onClick={() => switchLanguage("english")}>English</button>
      </div>
    );
  }

  const renderLanguageSpecificContent = () => {
    const languageContent = {
      english: (
        <div>
          <p>Your Account: {account}</p>
          <p>Your Balance: {balance}</p>
          <label>
            Amount:
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <button onClick={deposit}>Deposit</button>
          <button onClick={withdraw}>Withdraw</button>
          <p>Bank Name: My Bank</p>
          <p>IFSC Code: ABCDE123456</p>
          <p>PAN Number: ABCDE1234F</p>
          <p>Account Holder Name:  Sunil KS</p>
          <p>Education: Bachelor's Degree</p>
        </div>
      ),
      hindi: (
        <div>
          <p>आपका खाता: {account}</p>
          <p>आपका शेष: {balance}</p>
          <label>
            राशि:
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <button onClick={deposit}>जमा करें</button>
          <button onClick={withdraw}>निकालें</button>
          <p>बैंक का नाम: मेरा बैंक</p>
          <p>IFSC कोड: एबीसीडी१२३४५६</p>
          <p>PAN नंबर: एबीसीडीई१२३४एफ</p>
          <p>खाता धारक का नाम: जॉन डो</p>
          <p>शिक्षा: बैचलर्स डिग्री</p>
        </div>
      ),
      tamil: (
        <div>
          <p>உங்கள் கணக்கு: {account}</p>
          <p>உங்கள் மீது உள்ள மொத்தம்: {balance}</p>
          <label>
            தொகை:
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <button onClick={deposit}>வைத்திருக்கவும்</button>
          <button onClick={withdraw}>எடுத்துக்கொள்ளவும்</button>
          <p>வங்கி பெயர்: என் வங்கி</p>
          <p>IFSC குறியீடு: ஏபிசிடி123456</p>
          <p>PAN எண்: ஏபிசிடி1234எஃ</p>
          <p>கணக்கு உரியாளரின் பெயர்: ஜான் டோ</p>
          <p>கல்வி: பேச்லர்ஸ் டிகிரி</p>
        </div>
      ),
    };

    return languageContent[language] || languageContent.english;
  }

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          {renderLanguageButtons()}
          <button onClick={connectAccount}>मेटामास्क वॉलेट कनेक्ट करें</button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        {renderLanguageButtons()}
        {renderLanguageSpecificContent()}

        {/* Notification */}
        {notification.visible && (
          <div className={`notification ${notification.success ? 'success' : 'error'}`}>
            {notification.message} {notification.type && `(${notification.type} ${amount} ETH)`}
          </div>
        )}
      </div>
    );
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>{language === 'english' ? 'Welcome to the Metacrafters ATM!' : language === 'hindi' ? 'मेटाक्राफ्टर्स एटीएम में आपका स्वागत है!' : 'வருக Metacrafters ஏடிஎம்!'}</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: yellow; /* Yellow Background */
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px;
          border-radius: 5px;
          color: #fff;
          font-weight: bold;
        }

        .success {
          background-color: #4CAF50;
        }

        .error {
          background-color: #f44336;
        }
      `}
      </style>
    </main>
  );
}
