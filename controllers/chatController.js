const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Get user chats
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;

    if (!userId) {
      return res.status(400).json({
        error: 'Invalid request'
      });
    }

    const chats = await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map(chat => ({
      id: chat._id.toString(),
      name: chat.name,
      participants: chat.participants.map(p => p.toString()),
      lastMessage: chat.lastMessage || null,
      lastMessageTime: chat.lastMessageTime ? chat.lastMessageTime.toISOString() : null,
      unreadCount: chat.unreadCount,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    }));

    res.json(formattedChats);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching chats'
    });
  }
};

// Create chat
exports.createChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, participants } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        error: 'Name and participants array are required'
      });
    }

    // Verify all participants exist
    const participantUsers = await User.find({ _id: { $in: participants } });
    if (participantUsers.length !== participants.length) {
      return res.status(400).json({
        error: 'One or more participants not found'
      });
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([userId.toString(), ...participants])];

    const chat = new Chat({
      name,
      participants: allParticipants
    });

    await chat.save();

    const formattedChat = {
      id: chat._id.toString(),
      name: chat.name,
      participants: chat.participants.map(p => p.toString()),
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: 0,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    };

    res.status(201).json(formattedChat);
  } catch (error) {
    res.status(400).json({
      error: 'Error creating chat'
    });
  }
};

// Get chat by ID
exports.getChatById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Chat ID is required'
      });
    }

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        error: 'You are not a participant of this chat'
      });
    }

    const formattedChat = {
      id: chat._id.toString(),
      name: chat.name,
      participants: chat.participants.map(p => p.toString()),
      lastMessage: chat.lastMessage || null,
      lastMessageTime: chat.lastMessageTime ? chat.lastMessageTime.toISOString() : null,
      unreadCount: chat.unreadCount,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    };

    res.json(formattedChat);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching chat'
    });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Chat ID is required'
      });
    }

    // Verify chat exists and user is participant (optional check for testing)
    if (userId) {
      const chat = await Chat.findById(id);
      if (!chat) {
        return res.status(404).json({
          error: 'Chat not found'
        });
      }

      const isParticipant = chat.participants.some(
        p => p.toString() === userId.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({
          error: 'You are not a participant of this chat'
        });
      }
    }

    const messages = await Message.find({ chatId: id })
      .populate('userId', 'username displayName avatarUrl')
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => {
      const user = msg.userId;
      return {
        id: msg._id.toString(),
        chatId: msg.chatId.toString(),
        userId: msg.userId._id.toString(),
        userName: user.displayName || user.fullName || user.username,
        text: msg.text,
        createdAt: msg.createdAt.toISOString()
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    res.status(400).json({
      error: 'Error fetching messages'
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.userId || process.env.TEST_USER_ID;
    const { id } = req.params;
    const { text } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!id) {
      return res.status(400).json({
        error: 'Chat ID is required'
      });
    }

    if (!text) {
      return res.status(400).json({
        error: 'Message text is required'
      });
    }

    // Verify chat exists and user is participant
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({
        error: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        error: 'You are not a participant of this chat'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Create message
    const message = new Message({
      chatId: id,
      userId,
      text
    });

    await message.save();

    // Update chat's last message
    await Chat.findByIdAndUpdate(id, {
      lastMessage: text,
      lastMessageTime: new Date()
    });

    // Populate user info
    await message.populate('userId', 'username displayName avatarUrl');

    const formattedMessage = {
      id: message._id.toString(),
      chatId: message.chatId.toString(),
      userId: message.userId._id.toString(),
      userName: user.displayName || user.fullName || user.username,
      text: message.text,
      createdAt: message.createdAt.toISOString()
    };

    res.status(201).json(formattedMessage);
  } catch (error) {
    res.status(400).json({
      error: 'Error sending message'
    });
  }
};

