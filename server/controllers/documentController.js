const fs = require('fs');
const Document = require('../models/Document');
const extractText = require('../utils/extractText');
const { chunkText } = require('../utils/chunkText');
const embedDocument = require('../utils/embedDocument');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let extractedText;
    try {
      extractedText = await extractText(filePath, fileType);
    } catch (extractErr) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Could not extract text from this file' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No readable text found in this file' });
    }

    const rawChunks = chunkText(extractedText, 500, 50);
    const chunks = rawChunks.map((text, index) => ({ text, chunkIndex: index }));

    const document = await Document.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileType,
      extractedText,
      chunks,
      status: 'chunked',
    });

    fs.unlinkSync(filePath);

    // respond to the user immediately after chunking...
    res.status(201).json({
      _id: document._id,
      originalName: document.originalName,
      status: 'chunked',
      chunkCount: chunks.length,
      message: 'Document uploaded. Embedding in progress.',
    });

    // ...then embed in the background, after the response is sent
    embedDocument(document._id).catch((err) => {
      console.error('Embedding failed for document', document._id, err.message);
    });
  } catch (err) {
    next(err);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .select('-extractedText -chunks.text -chunks.embedding')
      .sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getDocuments };