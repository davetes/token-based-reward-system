import React, { useState, useEffect } from 'react';
import './RewardActions.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function RewardActions({ account, onRewardClaimed }) {
  const [actions, setActions] = useState({});
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/actions`);
      const data = await response.json();
      setActions(data.actions || {});
    } catch (error) {
      console.error('Error fetching actions:', error);
      setMessage({ type: 'error', text: 'Failed to load reward actions' });
    }
  };

  const claimReward = async (action) => {
    if (!account) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    setClaiming({ ...claiming, [action]: true });
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/rewards/distribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account,
          action: action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Successfully claimed ${data.rewardAmount} RWD tokens for ${action}!`,
        });
        onRewardClaimed();
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to claim reward' });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      setMessage({ type: 'error', text: 'Failed to claim reward. Please try again.' });
    } finally {
      setClaiming({ ...claiming, [action]: false });
    }
  };

  const actionLabels = {
    signup: 'Sign Up',
    login: 'Daily Login',
    referral: 'Refer a Friend',
    task_complete: 'Complete Task',
  };

  const actionIcons = {
    signup: '👤',
    login: '🔐',
    referral: '👥',
    task_complete: '✅',
  };

  return (
    <div className="card reward-actions">
      <h2>Available Rewards</h2>
      
      {message.text && (
        <div className={message.type === 'error' ? 'error' : 'success'}>
          {message.text}
        </div>
      )}

      <div className="actions-grid">
        {Object.entries(actions).map(([action, reward]) => (
          <div key={action} className="action-card">
            <div className="action-icon">{actionIcons[action] || '🎁'}</div>
            <div className="action-content">
              <h3>{actionLabels[action] || action}</h3>
              <div className="reward-amount">
                {parseFloat(reward).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4
                })} RWD
              </div>
              <button
                className="button claim-button"
                onClick={() => claimReward(action)}
                disabled={claiming[action]}
              >
                {claiming[action] ? 'Claiming...' : 'Claim Reward'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(actions).length === 0 && (
        <div className="no-actions">
          <p>No reward actions available at the moment.</p>
        </div>
      )}
    </div>
  );
}

export default RewardActions;

