const User = require('../models/User');

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    // For testing, if no userId, return error or use test user
    const userId = req.userId || process.env.TEST_USER_ID;

    if (!userId) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching user'
    });
  }
};

// Update current user profile
exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;

    if (!userId) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { username, email, displayName, fullName, avatarUrl } = req.body;

    // Build update object
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (displayName !== undefined) updateData.displayName = displayName || null;
    if (fullName !== undefined) updateData.fullName = fullName || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(user.toJSON());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Username or email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Error updating user'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching user'
    });
  }
};

