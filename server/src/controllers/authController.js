// server/controllers/authController.js
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Register or login user with just a username
exports.registerOrLogin = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Check if username already exists
    let user = await User.findOne({ username: username.trim() });

    if (user) {
      // Update last active time
      user.lastActive = new Date();
      await user.save();
      
      return res.status(200).json({
        success: true,
        user: {
          id: user.userId,
          username: user.username
        }
      });
    }

    // Create new user if not exists
    const userId = `user_${uuidv4()}`;
    user = new User({
      username: username.trim(),
      userId
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user.userId,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Check if username is available
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const existingUser = await User.findOne({ username: username.trim() });
    
    res.json({
      success: true,
      isAvailable: !existingUser
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking username'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId)
    const user = await User.findOne({ userId });

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.userId,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};