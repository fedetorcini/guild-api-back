const Game = require('../models/Game');
const Review = require('../models/Review');

// Get all games with pagination
exports.getAllGames = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const games = await Game.find()
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    // Format games to include id field
    const formattedGames = games.map(game => ({
      id: game._id.toString(),
      title: game.title,
      description: game.description,
      images: game.images,
      ratingValue: game.ratingValue,
      reviewsCount: game.reviewsCount,
      releaseDate: game.releaseDate,
      developerPublisher: game.developerPublisher,
      platforms: game.platforms,
      genres: game.genres,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }));

    res.json(formattedGames);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching games'
    });
  }
};

// Get game by ID
exports.getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Game ID is required'
      });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        error: 'Game not found'
      });
    }

    // Format game to include id field
    const formattedGame = {
      id: game._id.toString(),
      title: game.title,
      description: game.description,
      images: game.images,
      ratingValue: game.ratingValue,
      reviewsCount: game.reviewsCount,
      releaseDate: game.releaseDate,
      developerPublisher: game.developerPublisher,
      platforms: game.platforms,
      genres: game.genres,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    };

    res.json(formattedGame);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching game'
    });
  }
};

// Create new game
exports.createGame = async (req, res) => {
  try {
    const { title, description, images, releaseDate, developerPublisher, platforms, genres } = req.body;

    if (!title || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: 'Title and images array are required'
      });
    }

    const game = new Game({
      title,
      description: description || null,
      images,
      releaseDate: releaseDate || null,
      developerPublisher: developerPublisher || null,
      platforms: platforms || null,
      genres: genres || null,
      ratingValue: 0.0,
      reviewsCount: 0
    });

    await game.save();

    // Format game to include id field
    const formattedGame = {
      id: game._id.toString(),
      title: game.title,
      description: game.description,
      images: game.images,
      ratingValue: game.ratingValue,
      reviewsCount: game.reviewsCount,
      releaseDate: game.releaseDate,
      developerPublisher: game.developerPublisher,
      platforms: game.platforms,
      genres: game.genres,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    };

    res.status(201).json(formattedGame);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(400).json({
      error: 'Error creating game'
    });
  }
};

// Search games
exports.searchGames = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const games = await Game.find({
      $text: { $search: q }
    }).sort({ score: { $meta: 'textScore' } });

    // Fallback to regex search if text index doesn't work
    const regexGames = games.length === 0
      ? await Game.find({
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }).limit(20)
      : games;

    // Format games to include id field
    const formattedGames = regexGames.map(game => ({
      id: game._id.toString(),
      title: game.title,
      description: game.description,
      images: game.images,
      ratingValue: game.ratingValue,
      reviewsCount: game.reviewsCount,
      releaseDate: game.releaseDate,
      developerPublisher: game.developerPublisher,
      platforms: game.platforms,
      genres: game.genres,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }));

    res.json(formattedGames);
  } catch (error) {
    res.status(400).json({
      error: 'Error searching games'
    });
  }
};

// Get new games (ordered by release date)
exports.getNewGames = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const games = await Game.find({
      releaseDate: { $ne: null }
    })
      .sort({ releaseDate: -1 })
      .limit(limit);

    // Format games to include id field
    const formattedGames = games.map(game => ({
      id: game._id.toString(),
      title: game.title,
      description: game.description,
      images: game.images,
      ratingValue: game.ratingValue,
      reviewsCount: game.reviewsCount,
      releaseDate: game.releaseDate,
      developerPublisher: game.developerPublisher,
      platforms: game.platforms,
      genres: game.genres,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }));

    res.json(formattedGames);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching new games'
    });
  }
};

// Helper function to update game rating (called when reviews are added/updated/deleted)
exports.updateGameRating = async (gameId) => {
  try {
    const reviews = await Review.find({ gameId });
    
    if (reviews.length === 0) {
      await Game.findByIdAndUpdate(gameId, {
        ratingValue: 0.0,
        reviewsCount: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Game.findByIdAndUpdate(gameId, {
      ratingValue: parseFloat(averageRating.toFixed(1)),
      reviewsCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating game rating:', error);
  }
};

