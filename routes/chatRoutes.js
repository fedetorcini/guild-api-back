const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// GET /chats - Get user chats (temporarily disabled auth for testing)
router.get('/', authenticate, chatController.getUserChats);

// POST /chats - Create chat (requires auth)
router.post('/', authenticate, chatController.createChat);

// GET /chats/:id - Get chat by ID (requires auth)
router.get('/:id', authenticate, chatController.getChatById);

// GET /chats/:id/messages - Get chat messages (temporarily disabled auth for testing)
router.get('/:id/messages', authenticate, chatController.getChatMessages);

// POST /chats/:id/messages - Send message (temporarily disabled auth for testing)
router.post('/:id/messages', authenticate, chatController.sendMessage);

module.exports = router;

