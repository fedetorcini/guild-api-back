const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

// GET /favorites - Get user favorites (temporarily disabled auth for testing)
router.get('/', authenticate, favoriteController.getUserFavorites);

// POST /favorites - Add favorite (temporarily disabled auth for testing)
router.post('/', authenticate, favoriteController.addFavorite);

// GET /favorites/:gameId/status - Check favorite status (temporarily disabled auth for testing)
router.get('/:gameId/status', authenticate, favoriteController.checkFavoriteStatus);

// DELETE /favorites/:gameId - Remove favorite (temporarily disabled auth for testing)
router.delete('/:gameId', authenticate, favoriteController.removeFavorite);

module.exports = router;

