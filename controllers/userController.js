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

exports.followUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ error: "User to follow not found" });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ error: "Already following this user" });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "User followed successfully" });

  } catch (error) {
    res.status(500).json({ error: "Error following user" });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ error: "User to unfollow not found" });
    }

    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
    );

    targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "User unfollowed successfully" });

  } catch (error) {
    res.status(500).json({ error: "Error unfollowing user" });
  }
};


exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('followers');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followers = await User.find({ _id: { $in: user.followers } })
        .select('id username displayName avatarUrl');

    res.json({
      count: followers.length,
      users: followers
    });

  } catch (error) {
    res.status(500).json({ error: "Error fetching followers" });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('following');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = await User.find({ _id: { $in: user.following } })
        .select('id username displayName avatarUrl');

    res.json({
      count: following.length,
      users: following
    });

  } catch (error) {
    res.status(500).json({ error: "Error fetching following" });
  }
};




