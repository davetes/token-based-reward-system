const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const rewardRoutes = require('./routes/rewards');
const transactionRoutes = require('./routes/transactions');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reward-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

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

