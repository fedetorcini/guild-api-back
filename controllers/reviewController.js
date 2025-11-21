const Review = require('../models/Review');
const User = require('../models/User');
const Game = require('../models/Game');
const gameController = require('./gameController');

// Get reviews by game
exports.getReviewsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({
        error: 'Game ID is required'
      });
    }

    const reviews = await Review.find({ gameId })
      .populate('userId', 'username displayName avatarUrl')
      .sort({ createdAt: -1 });

    // Format response to match API spec
    const formattedReviews = reviews
      .filter(review => review.userId) // Filter out reviews with deleted users
      .map(review => {
        const user = review.userId;
        return {
          id: review._id.toString(),
          gameId: review.gameId.toString(),
          userId: review.userId._id.toString(),
          userName: user.displayName || user.fullName || user.username,
          handle: user.username,
          avatarUrl: user.avatarUrl || null,
          text: review.text,
          rating: review.rating,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString()
        };
      });

    res.json(formattedReviews);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching reviews'
    });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { gameId, text, rating } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!gameId || !text || rating === undefined) {
      return res.status(400).json({
        error: 'Game ID, text, and rating are required'
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating must be an integer between 1 and 5'
      });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        error: 'Game not found'
      });
    }

    // Check if user already reviewed this game
    const existingReview = await Review.findOne({ gameId, userId });
    if (existingReview) {
      return res.status(400).json({
        error: 'You have already reviewed this game'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Create review
    const review = new Review({
      gameId,
      userId,
      text,
      rating
    });

    await review.save();

    // Update game rating
    await gameController.updateGameRating(gameId);

    // Populate and format response
    await review.populate('userId', 'username displayName avatarUrl');
    const formattedReview = {
      id: review._id.toString(),
      gameId: review.gameId.toString(),
      userId: review.userId._id.toString(),
      userName: user.displayName || user.fullName || user.username,
      handle: user.username,
      avatarUrl: user.avatarUrl || null,
      text: review.text,
      rating: review.rating,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString()
    };

    res.status(201).json(formattedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'You have already reviewed this game'
      });
    }

    res.status(400).json({
      error: 'Error creating review'
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { id } = req.params;
    const { text, rating } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Review ID is required'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'You can only update your own reviews'
      });
    }

    // Update fields
    if (text !== undefined) review.text = text;
    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Rating must be an integer between 1 and 5'
        });
      }
      review.rating = rating;
    }

    await review.save();

    // Update game rating
    await gameController.updateGameRating(review.gameId);

    // Get user info
    const user = await User.findById(userId);
    await review.populate('userId', 'username displayName avatarUrl');

    const formattedReview = {
      id: review._id.toString(),
      gameId: review.gameId.toString(),
      userId: review.userId._id.toString(),
      userName: user.displayName || user.fullName || user.username,
      handle: user.username,
      avatarUrl: user.avatarUrl || null,
      text: review.text,
      rating: review.rating,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString()
    };

    res.json(formattedReview);
  } catch (error) {
    res.status(400).json({
      error: 'Error updating review'
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Review ID is required'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'You can only delete your own reviews'
      });
    }

    const gameId = review.gameId;
    await Review.findByIdAndDelete(id);

    // Update game rating
    await gameController.updateGameRating(gameId);

    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      error: 'Error deleting review'
    });
  }
};

