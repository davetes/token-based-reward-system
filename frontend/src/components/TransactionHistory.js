import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function TransactionHistory({ account }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account]);

  const fetchTransactions = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${account}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount) => {
    try {
      const num = parseFloat(amount) / 1e18; // Convert from wei
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
    } catch {
      return amount;
    }
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      reward: 'Reward',
      transfer: 'Transfer',
      mint: 'Mint',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { class: 'status-confirmed', text: '✓ Confirmed' },
      pending: { class: 'status-pending', text: '⏳ Pending' },
      failed: { class: 'status-failed', text: '✗ Failed' },
    };
    return badges[status] || { class: 'status-unknown', text: status };
  };

  if (loading) {
    return (
      <div className="card transaction-history">
        <h2>Transaction History</h2>
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="card transaction-history">
      <div className="history-header">
        <h2>Transaction History</h2>
        <button className="refresh-button" onClick={fetchTransactions} title="Refresh">
          🔄
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found. Start earning rewards to see your transaction history!</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((tx, index) => {
            const statusBadge = getStatusBadge(tx.status);
            const isIncoming = tx.to?.toLowerCase() === account?.toLowerCase();

            return (
              <div key={index} className="transaction-item">
                <div className="transaction-main">
                  <div className="transaction-type">
                    <span className={`type-badge type-${tx.type}`}>
                      {getTransactionTypeLabel(tx.type)}
                    </span>
                    {tx.action && (
                      <span className="action-label">{tx.action}</span>
                    )}
                  </div>
                  <div className="transaction-amount">
                    {isIncoming ? '+' : '-'}
                    {formatAmount(tx.amount)} RWD
                  </div>
                </div>
                <div className="transaction-details">
                  <div className="transaction-addresses">
                    <div>
                      <strong>From:</strong> {formatAddress(tx.from)}
                    </div>
                    <div>
                      <strong>To:</strong> {formatAddress(tx.to)}
                    </div>
                  </div>
                  <div className="transaction-meta">
                    <div className="transaction-date">{formatDate(tx.timestamp)}</div>
                    <div className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </div>
                  </div>
                  {tx.transactionHash && (
                    <div className="transaction-hash">
                      <strong>Hash:</strong>{' '}
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hash-link"
                      >
                        {formatAddress(tx.transactionHash)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;

