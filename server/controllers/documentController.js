const fs = require('fs');
const Document = require('../models/Document');
const extractText = require('../utils/extractText');

// @route POST /api/documents/upload
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
      fs.unlinkSync(filePath); // clean up the file if extraction fails
      return res.status(400).json({ message: 'Could not extract text from this file' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No readable text found in this file' });
    }

    const document = await Document.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileType,
      extractedText,
      status: 'processing', // will become 'ready' after chunking/embedding in Week 2
    });

    // delete the temp file now that text is safely stored in MongoDB
    fs.unlinkSync(filePath);

    res.status(201).json({
      _id: document._id,
      originalName: document.originalName,
      status: document.status,
      textLength: extractedText.length,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .select('-extractedText') // don't send full text in the list view
      .sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getDocuments };