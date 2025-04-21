

// routes/pollRoutes.js
const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');


router.get('/:roomId', pollController.getPoll);


router.post('/', pollController.createPoll);


router.post('/:roomId/vote', pollController.votePoll);


router.put('/:roomId/close', pollController.closePoll);

module.exports = router;
