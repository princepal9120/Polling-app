const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

exports.registerOrLogin = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    let user = await User.findOne({ username: username.trim() });

    if (user) {
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
