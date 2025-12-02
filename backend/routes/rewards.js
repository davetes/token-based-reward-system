const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const RewardAction = require('../models/RewardAction');
const Transaction = require('../models/Transaction');

// Initialize Web3 provider and contracts
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

const REWARD_TOKEN_ABI = require('../abis/RewardToken.json');
const REWARD_SYSTEM_ABI = require('../abis/RewardSystem.json');

const rewardTokenAddress = process.env.REWARD_TOKEN_ADDRESS || '';
const rewardSystemAddress = process.env.REWARD_SYSTEM_ADDRESS || '';

const rewardToken = new ethers.Contract(rewardTokenAddress, REWARD_TOKEN_ABI, wallet);
const rewardSystem = new ethers.Contract(rewardSystemAddress, REWARD_SYSTEM_ABI, wallet);

/**
 * GET /api/rewards/balance/:address
 * Get token balance for a user address
 */
router.get('/balance/:address', async (req, res) => {
  try {
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
    res.status(500).json({ error: 'Failed to fetch balance' });
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
    const rewardAction = new RewardAction({
      userAddress,
      action,
      rewardAmount: rewardAmount.toString(),
      transactionHash: tx.hash,
      timestamp: new Date()
    });
    await rewardAction.save();
    
    // Save transaction
    const transaction = new Transaction({
      from: rewardSystemAddress,
      to: userAddress,
      amount: rewardAmount.toString(),
      type: 'reward',
      action,
      transactionHash: tx.hash,
      status: 'confirmed',
      timestamp: new Date()
    });
    await transaction.save();
    
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
    
    // Get from blockchain
    const totalRewards = await rewardSystem.getUserTotalRewards(address);
    
    // Get from database
    const rewardActions = await RewardAction.find({ userAddress: address })
      .sort({ timestamp: -1 });
    
    res.json({
      address,
      totalRewards: ethers.formatEther(totalRewards),
      totalRewardsWei: totalRewards.toString(),
      rewardHistory: rewardActions
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(500).json({ error: 'Failed to fetch user rewards' });
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
    
    for (const action of actions) {
      const reward = await rewardSystem.actionRewards(action);
      if (reward > 0n) {
        actionRewards[action] = ethers.formatEther(reward);
      }
    }
    
    res.json({ actions: actionRewards });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

module.exports = router;

