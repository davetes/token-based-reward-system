const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

/**
 * GET /api/transactions/:address
 * Get all transactions for a user address
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const transactions = await Transaction.find({
      $or: [
        { from: address.toLowerCase() },
        { to: address.toLowerCase() }
      ]
    })
    .sort({ timestamp: -1 })
    .limit(100);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions
 * Get all transactions (with pagination)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Transaction.countDocuments();
    
    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/hash/:hash
 * Get transaction by hash
 */
router.get('/hash/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    const transaction = await Transaction.findOne({ transactionHash: hash });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;

