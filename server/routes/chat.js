const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { sendMessage, getChats, getChatById, deleteChat } = require('../controllers/chatController');

router.post('/', protect, sendMessage);
router.get('/', protect, getChats);
router.get('/:id', protect, getChatById);
router.delete('/:id', protect, deleteChat);

module.exports = router;