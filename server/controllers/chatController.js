const Chat = require('../models/Chat');
const retrieveChunks = require('../utils/retrieveChunks');
const generateAnswer = require('../utils/generateAnswer');

// @route POST /api/chat
const sendMessage = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
      if (!chat) return res.status(404).json({ message: 'Chat not found' });
    } else {
      chat = await Chat.create({
        user: req.user._id,
        title: message.slice(0, 50),
        messages: [],
      });
    }

    chat.messages.push({ role: 'user', content: message });

    const retrievedChunks = await retrieveChunks(req.user._id, message);
    const { answer, sources } = await generateAnswer(message, retrievedChunks);

    chat.messages.push({ role: 'assistant', content: answer, sources });

    await chat.save();

    res.status(200).json({
      chatId: chat._id,
      answer,
      sources,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/chat
const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/chat/:id
const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/chat/:id
const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    await chat.deleteOne();

    res.status(200).json({ message: 'Chat deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getChats, getChatById, deleteChat };