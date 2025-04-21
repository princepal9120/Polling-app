// controllers/pollController.js
const Poll = require('../models/Poll');

/**
 * GET /api/polls/:roomId
 * Fetch a poll by room ID
 */
exports.getPoll = async (req, res) => {
  try {
    const { roomId } = req.params;
    const poll = await Poll.findOne({ roomId });
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    const voteCounts = poll.getVoteCounts();
    res.json({
      success: true,
      poll: {
        id: poll.roomId,
        question: poll.question,
        options: poll.options,
        votes: voteCounts,
        voters: poll.votes.map(v => ({ userId: v.userId, username: v.username, optionIndex: v.optionIndex })),
        expiresAt: poll.expiresAt,
        isActive: poll.isActive && new Date() < poll.expiresAt
      }
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/polls
 * Create a new poll
 */
exports.createPoll = async (req, res) => {
  try {
    const { roomId, question, options, expiresAt } = req.body;
    const existing = await Poll.findOne({ roomId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Room ID already in use' });
    }

    const poll = new Poll({ roomId, question, options, expiresAt });
    await poll.save();
    res.status(201).json({ success: true, poll });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/polls/:roomId/vote
 * Register a vote in a poll
 */
exports.votePoll = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, username, optionIndex } = req.body;

    const poll = await Poll.findOne({ roomId });
    if (!poll || !poll.isActive || new Date() > poll.expiresAt) {
      return res.status(400).json({ success: false, message: 'Poll closed or not found' });
    }

    poll.votes.push({ userId, username, optionIndex });
    await poll.save();

    res.json({ success: true, message: 'Vote recorded' });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/polls/:roomId/close
 * Manually close a poll
 */
exports.closePoll = async (req, res) => {
  try {
    const { roomId } = req.params;
    const poll = await Poll.findOneAndUpdate(
      { roomId },
      { isActive: false },
      { new: true }
    );
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({ success: true, poll });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
