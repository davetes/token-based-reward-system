import React, { useState, useEffect } from 'react';
import './TokenBalance.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function TokenBalance({ balance, address }) {
  const [loading, setLoading] = useState(false);

  const refreshBalance = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/balance/${address}`);
      const data = await response.json();
      // Balance is updated via parent component
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card token-balance">
      <div className="balance-header">
        <h2>Token Balance</h2>
        <button
          className="refresh-button"
          onClick={refreshBalance}
          disabled={loading}
          title="Refresh balance"
        >
          🔄
        </button>
      </div>
      <div className="balance-display">
        <div className="balance-amount">
          {parseFloat(balance).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
          })}
        </div>
        <div className="balance-label">RWD Tokens</div>
      </div>
      <div className="balance-info">
        <p><strong>Address:</strong> {address}</p>
      </div>
    </div>
  );
}

export default TokenBalance;

