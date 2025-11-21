const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// GET /games - Get all games
router.get('/', gameController.getAllGames);

// GET /games/search - Search games
router.get('/search', gameController.searchGames);

// GET /games/new - Get new games
router.get('/new', gameController.getNewGames);

// GET /games/:id - Get game by ID
router.get('/:id', gameController.getGameById);

// POST /games - Create game
router.post('/', gameController.createGame);

module.exports = router;

