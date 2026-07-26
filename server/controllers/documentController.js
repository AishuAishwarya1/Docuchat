const fs = require('fs');
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const { extractText, cleanExtractedText } = require('../utils/extractText');
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

    extractedText = cleanExtractedText(extractedText);

    const rawChunks = chunkText(extractedText, { chunkSize: 200, chunkOverlap: 30 });

    const document = await Document.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileType,
      extractedText,
      status: 'chunked',
    });

    const chunkDocs = rawChunks.map((chunk) => ({
      document: document._id,
      user: req.user._id,
      text: chunk.text,
      chunkIndex: chunk.index,
      tokenCount: chunk.tokenCount,
      charStart: chunk.charStart,
      charEnd: chunk.charEnd,
    }));

    await Chunk.insertMany(chunkDocs);

    fs.unlinkSync(filePath);

    res.status(201).json({
      _id: document._id,
      originalName: document.originalName,
      status: 'chunked',
      chunkCount: chunkDocs.length,
      message: 'Document uploaded. Embedding in progress.',
    });

    embedDocument(document._id).catch((err) => {
      console.error('Embedding failed for document', document._id, err.message);
    });
  } catch (err) {
    next(err);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (err) {
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    await Chunk.deleteMany({ document: document._id });
    await document.deleteOne();

    res.status(200).json({ message: 'Document and its chunks deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };