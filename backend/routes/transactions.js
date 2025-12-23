const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * GET /api/transactions/:address
 * Get all transactions for a user address
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const addr = String(address).toLowerCase();

    const result = await query(
      `
        SELECT
          from_address AS "from",
          to_address AS "to",
          amount,
          type,
          action,
          transaction_hash AS "transactionHash",
          status,
          timestamp
        FROM transactions
        WHERE from_address = $1 OR to_address = $1
        ORDER BY timestamp DESC
        LIMIT 100
      `,
      [addr]
    );

    res.json({ transactions: result.rows });
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
    const offset = (page - 1) * limit;

    const [transactionsResult, totalResult] = await Promise.all([
      query(
        `
          SELECT
            from_address AS "from",
            to_address AS "to",
            amount,
            type,
            action,
            transaction_hash AS "transactionHash",
            status,
            timestamp
          FROM transactions
          ORDER BY timestamp DESC
          OFFSET $1
          LIMIT $2
        `,
        [offset, limit]
      ),
      query('SELECT COUNT(*)::bigint AS total FROM transactions')
    ]);

    const total = Number(totalResult.rows[0]?.total || 0);

    res.json({
      transactions: transactionsResult.rows,
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

    const result = await query(
      `
        SELECT
          from_address AS "from",
          to_address AS "to",
          amount,
          type,
          action,
          transaction_hash AS "transactionHash",
          status,
          timestamp
        FROM transactions
        WHERE transaction_hash = $1
        LIMIT 1
      `,
      [hash]
    );

    const transaction = result.rows[0];

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

