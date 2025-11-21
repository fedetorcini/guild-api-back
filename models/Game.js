const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  images: [{
    type: String,
    trim: true
  }],
  ratingValue: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  releaseDate: {
    type: String,
    trim: true,
    default: null
  },
  developerPublisher: {
    type: String,
    trim: true,
    default: null
  },
  platforms: {
    type: String,
    trim: true,
    default: null
  },
  genres: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
gameSchema.index({ title: 'text', description: 'text' });
gameSchema.index({ releaseDate: -1 });
gameSchema.index({ ratingValue: -1 });

module.exports = mongoose.model('Game', gameSchema);

