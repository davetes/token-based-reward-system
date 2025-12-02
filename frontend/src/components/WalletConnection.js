import React from 'react';
import './WalletConnection.css';

function WalletConnection({ account, onConnect, onDisconnect, loading }) {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="card wallet-connection">
      <h2>Wallet Connection</h2>
      {account ? (
        <div className="wallet-connected">
          <div className="wallet-info">
            <div className="wallet-status">
              <span className="status-indicator connected"></span>
              <span>Connected</span>
            </div>
            <div className="wallet-address">
              <strong>Address:</strong> {formatAddress(account)}
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(account);
                  alert('Address copied to clipboard!');
                }}
              >
                📋
              </button>
            </div>
          </div>
          <button className="button button-secondary" onClick={onDisconnect}>
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="wallet-disconnected">
          <p>Connect your MetaMask wallet to start earning rewards</p>
          <button
            className="button"
            onClick={onConnect}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletConnection;

