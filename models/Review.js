const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from same user for same game
reviewSchema.index({ gameId: 1, userId: 1 }, { unique: true });

// Index for querying reviews by game
reviewSchema.index({ gameId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

