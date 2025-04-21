// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register or login user
router.post('/auth/login', authController.registerOrLogin);

// Check if username is available
router.get('/auth/check-username', authController.checkUsername);

// Get user by ID
router.get('/auth/users/:userId', authController.getUserById);

module.exports = router;