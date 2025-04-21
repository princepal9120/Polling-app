

// routes/pollRoutes.js
const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

// Fetch poll by room ID
router.get('/:roomId', pollController.getPoll);

// Create a new poll
router.post('/', pollController.createPoll);

// Vote in a poll
router.post('/:roomId/vote', pollController.votePoll);

// Close a poll manually
router.put('/:roomId/close', pollController.closePoll);

module.exports = router;
