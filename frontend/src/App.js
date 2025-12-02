import React, { useState, useEffect } from 'react';
import './App.css';
import WalletConnection from './components/WalletConnection';
import TokenBalance from './components/TokenBalance';
import RewardActions from './components/RewardActions';
import TransactionHistory from './components/TransactionHistory';
import { ethers } from 'ethers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (account) {
      fetchBalance();
    }
  }, [account]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setBalance('0');
  };

  const fetchBalance = async () => {
    if (!account) return;

    try {
      const response = await fetch(`${API_BASE_URL}/rewards/balance/${account}`);
      const data = await response.json();
      setBalance(data.balance || '0');
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleRewardClaimed = () => {
    fetchBalance();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎁 Token Reward System</h1>
        <p>Blockchain-powered rewards for your actions</p>
      </header>

      <main className="App-main">
        <WalletConnection
          account={account}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
          loading={loading}
        />

        {account && (
          <>
            <TokenBalance balance={balance} address={account} />
            <RewardActions
              account={account}
              onRewardClaimed={handleRewardClaimed}
            />
            <TransactionHistory account={account} />
          </>
        )}

        {!account && (
          <div className="welcome-message">
            <h2>Welcome to Token Reward System</h2>
            <p>Connect your MetaMask wallet to start earning rewards!</p>
            <ul>
              <li>✅ Secure blockchain-based rewards</li>
              <li>✅ Track all your transactions</li>
              <li>✅ Earn tokens for completing actions</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

