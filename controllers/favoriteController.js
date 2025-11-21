const Favorite = require('../models/Favorite');
const Game = require('../models/Game');

// Get user favorites
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;

    if (!userId) {
      return res.status(400).json({
        error: 'Invalid request'
      });
    }

    const favorites = await Favorite.find({ userId })
      .populate('gameId')
      .sort({ createdAt: -1 });

    const formattedFavorites = favorites.map(fav => {
      const game = fav.gameId;
      return {
        id: fav._id.toString(),
        userId: fav.userId.toString(),
        gameId: game._id.toString(),
        game: {
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
        },
        createdAt: fav.createdAt.toISOString()
      };
    });

    res.json(formattedFavorites);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching favorites'
    });
  }
};

// Add favorite
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { gameId } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!gameId) {
      return res.status(400).json({
        error: 'Game ID is required'
      });
    }

    // Check if game exists
    const existingGame = await Game.findById(gameId);
    if (!existingGame) {
      return res.status(404).json({
        error: 'Game not found'
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ userId, gameId });
    if (existingFavorite) {
      return res.status(404).json({
        error: 'Game already in favorites'
      });
    }

    // Create favorite
    const favorite = new Favorite({
      userId,
      gameId
    });

    await favorite.save();
    await favorite.populate('gameId');

    const game = favorite.gameId;
    const formattedFavorite = {
      id: favorite._id.toString(),
      userId: favorite.userId.toString(),
      gameId: game._id.toString(),
      game: {
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
      },
      createdAt: favorite.createdAt.toISOString()
    };

    res.status(201).json(formattedFavorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(404).json({
        error: 'Game already in favorites'
      });
    }

    res.status(400).json({
      error: 'Error adding favorite'
    });
  }
};

// Remove favorite
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { gameId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!gameId) {
      return res.status(400).json({
        error: 'Game ID is required'
      });
    }

    const favorite = await Favorite.findOneAndDelete({ userId, gameId });

    if (!favorite) {
      return res.status(404).json({
        error: 'Favorite not found'
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      error: 'Error removing favorite'
    });
  }
};

// Check favorite status
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { gameId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'Invalid request'
      });
    }

    if (!gameId) {
      return res.status(400).json({
        error: 'Game ID is required'
      });
    }

    const favorite = await Favorite.findOne({ userId, gameId });

    res.json({
      isFavorite: !!favorite
    });
  } catch (error) {
    res.status(400).json({
      error: 'Error checking favorite status'
    });
  }
};

