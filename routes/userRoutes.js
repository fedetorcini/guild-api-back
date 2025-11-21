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

module.exports = router;

