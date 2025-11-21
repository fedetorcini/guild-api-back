const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// GET /reviews/games/:gameId - Get reviews by game
router.get('/games/:gameId', reviewController.getReviewsByGame);

// POST /reviews - Create review (temporarily disabled auth for testing)
router.post('/', authenticate, reviewController.createReview);

// PUT /reviews/:id - Update review (temporarily disabled auth for testing)
router.put('/:id', authenticate, reviewController.updateReview);

// DELETE /reviews/:id - Delete review (temporarily disabled auth for testing)
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;

