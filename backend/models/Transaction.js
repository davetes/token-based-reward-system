const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  to: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  amount: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['reward', 'transfer', 'mint'],
    required: true
  },
  action: {
    type: String,
    index: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);

