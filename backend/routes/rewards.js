const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { query } = require('../db');

// Initialize Web3 provider and contracts.
// NOTE: Do not create the Wallet/Contracts at module-load time, otherwise the server
// will crash on startup when env vars are not configured.
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

const REWARD_TOKEN_ABI = require("../abis/RewardToken.json");
const REWARD_SYSTEM_ABI = require("../abis/RewardSystem.json");

function isValidPrivateKey(pk) {
  // Ethers v6 expects a 32-byte hex private key.
  return typeof pk === "string" && /^0x[0-9a-fA-F]{64}$/.test(pk);
}

function getContracts() {
  const privateKey = process.env.PRIVATE_KEY;
  const rewardTokenAddress = process.env.REWARD_TOKEN_ADDRESS;
  const rewardSystemAddress = process.env.REWARD_SYSTEM_ADDRESS;

  if (!isValidPrivateKey(privateKey)) {
    const err = new Error(
      "Blockchain config missing/invalid: set PRIVATE_KEY to a 0x-prefixed 64-hex private key."
    );
    err.statusCode = 503;
    throw err;
  }

  if (!ethers.isAddress(rewardTokenAddress || "")) {
    const err = new Error(
      "Blockchain config missing/invalid: set REWARD_TOKEN_ADDRESS to a valid Ethereum address."
    );
    err.statusCode = 503;
    throw err;
  }

  if (!ethers.isAddress(rewardSystemAddress || "")) {
    const err = new Error(
      "Blockchain config missing/invalid: set REWARD_SYSTEM_ADDRESS to a valid Ethereum address."
    );
    err.statusCode = 503;
    throw err;
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  return {
    rewardTokenAddress,
    rewardSystemAddress,
    rewardToken: new ethers.Contract(rewardTokenAddress, REWARD_TOKEN_ABI, wallet),
    rewardSystem: new ethers.Contract(rewardSystemAddress, REWARD_SYSTEM_ABI, wallet)
  };
}

/**
 * GET /api/rewards/balance/:address
 * Get token balance for a user address
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { rewardToken } = getContracts();
    const { address } = req.params;
    const balance = await rewardToken.balanceOf(address);
    const formattedBalance = ethers.formatEther(balance);
    
    res.json({
      address,
      balance: formattedBalance,
      balanceWei: balance.toString()
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch balance' });
  }
});

/**
 * POST /api/rewards/distribute
 * Distribute reward to a user for completing an action
 */
router.post('/distribute', async (req, res) => {
  try {
    const { userAddress, action } = req.body;
    
    if (!userAddress || !action) {
      return res.status(400).json({ error: 'userAddress and action are required' });
    }
    
    const { rewardSystem, rewardSystemAddress } = getContracts();

    // Check if reward already claimed
    const hasClaimed = await rewardSystem.hasClaimedReward(userAddress, action);
    if (hasClaimed) {
      return res.status(400).json({ error: 'Reward already claimed for this action' });
    }
    
    // Get reward amount for action
    const rewardAmount = await rewardSystem.actionRewards(action);
    if (rewardAmount === 0n) {
      return res.status(400).json({ error: 'Invalid action or no reward set' });
    }
    
    // Distribute reward
    const tx = await rewardSystem.distributeReward(userAddress, action);
    await tx.wait();
    
    // Save to database
    await query(
      `
        INSERT INTO reward_actions (user_address, action, reward_amount, transaction_hash, timestamp)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (transaction_hash) DO NOTHING
      `,
      [
        String(userAddress).toLowerCase(),
        action,
        rewardAmount.toString(),
        tx.hash,
        new Date()
      ]
    );

    // Save transaction
    await query(
      `
        INSERT INTO transactions (
          from_address,
          to_address,
          amount,
          type,
          action,
          transaction_hash,
          status,
          timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (transaction_hash) DO NOTHING
      `,
      [
        String(rewardSystemAddress).toLowerCase(),
        String(userAddress).toLowerCase(),
        rewardAmount.toString(),
        'reward',
        action,
        tx.hash,
        'confirmed',
        new Date()
      ]
    );
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      rewardAmount: ethers.formatEther(rewardAmount),
      message: 'Reward distributed successfully'
    });
  } catch (error) {
    console.error('Error distributing reward:', error);
    res.status(500).json({ error: 'Failed to distribute reward', details: error.message });
  }
});

/**
 * GET /api/rewards/user/:address
 * Get all rewards for a user
 */
router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const { rewardSystem } = getContracts();

    // Get from blockchain
    const totalRewards = await rewardSystem.getUserTotalRewards(address);
    
    // Get from database
    const addr = String(address).toLowerCase();
    const rewardActionsResult = await query(
      `
        SELECT
          user_address AS "userAddress",
          action,
          reward_amount AS "rewardAmount",
          transaction_hash AS "transactionHash",
          timestamp
        FROM reward_actions
        WHERE user_address = $1
        ORDER BY timestamp DESC
      `,
      [addr]
    );

    res.json({
      address,
      totalRewards: ethers.formatEther(totalRewards),
      totalRewardsWei: totalRewards.toString(),
      rewardHistory: rewardActionsResult.rows
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch user rewards' });
  }
});

/**
 * GET /api/rewards/actions
 * Get all available actions and their reward amounts
 */
router.get('/actions', async (req, res) => {
  try {
    const actions = ['signup', 'login', 'referral', 'task_complete'];
    const actionRewards = {};
    
    const { rewardSystem } = getContracts();

    for (const action of actions) {
      const reward = await rewardSystem.actionRewards(action);
      if (reward > 0n) {
        actionRewards[action] = ethers.formatEther(reward);
      }
    }
    
    res.json({ actions: actionRewards });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch actions' });
  }
});

module.exports = router;

