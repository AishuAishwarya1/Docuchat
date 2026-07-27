const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { sendMessage, getChats, getChatById } = require('../controllers/chatController');

router.post('/', protect, sendMessage);
router.get('/', protect, getChats);
router.get('/:id', protect, getChatById);

module.exports = router;