// server/models/Poll.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  optionIndex: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const pollSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  votes: [voteSchema]
});

// Helper method to get vote counts
pollSchema.methods.getVoteCounts = function() {
  const counts = new Array(this.options.length).fill(0);
  this.votes.forEach(vote => {
    if (vote.optionIndex >= 0 && vote.optionIndex < counts.length) {
      counts[vote.optionIndex]++;
    }
  });
  return counts;
};

module.exports = mongoose.model('Poll', pollSchema);