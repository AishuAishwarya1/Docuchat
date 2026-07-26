const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const { generateEmbedding } = require('./generateEmbedding');

async function embedDocument(documentId) {
  const document = await Document.findById(documentId);
  if (!document) throw new Error('Document not found');

  document.status = 'embedding';
  await document.save();

  const chunks = await Chunk.find({ document: documentId });

  for (const chunk of chunks) {
    chunk.embedding = await generateEmbedding(chunk.text);
    await chunk.save();
  }

  document.status = 'ready';
  await document.save();

  return document;
}

module.exports = embedDocument;