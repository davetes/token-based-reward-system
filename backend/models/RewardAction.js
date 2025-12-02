const mongoose = require('mongoose');

const rewardActionSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  rewardAmount: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('RewardAction', rewardActionSchema);

