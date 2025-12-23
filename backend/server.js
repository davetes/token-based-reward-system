const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const rewardRoutes = require('./routes/rewards');
const transactionRoutes = require('./routes/transactions');

async function start() {
  try {
    await initDb();
    console.log("PostgreSQL schema ready");

    // Routes
    app.use('/api/rewards', rewardRoutes);
    app.use('/api/transactions', transactionRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Reward System API is running' });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("PostgreSQL init error:", err);
    process.exit(1);
  }
}

start();

