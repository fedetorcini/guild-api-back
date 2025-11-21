const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// GET /users/me - Get current user (temporarily disabled auth for testing)
router.get('/me', authenticate, userController.getCurrentUser);

// PUT /users/me - Update current user (temporarily disabled auth for testing)
router.put('/me', authenticate, userController.updateCurrentUser);

// GET /users/:id - Get user by ID (requires auth)
router.get('/:id', authenticate, userController.getUserById);

// POST /users/:id/follow - Follow an user by id(requires auth)
router.post('/:id/follow', authenticate, userController.followUser);

// POST /users/:id/unfollow - Unfollow an user by id(requires auth)
router.post('/:id/unfollow', authenticate, userController.unfollowUser);

// GET /users/:id/followers - Get a list users followers(requires auth)
router.get('/:id/followers', authenticate, userController.getFollowers);

// GET /users/:id/following - Get a list users following(requires auth)
router.get('/:id/following', authenticate, userController.getFollowing);

module.exports = router;

