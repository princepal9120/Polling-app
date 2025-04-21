// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/auth/login', authController.registerOrLogin);


router.get('/auth/check-username', authController.checkUsername);


router.get('/auth/users/:userId', authController.getUserById);

module.exports = router;