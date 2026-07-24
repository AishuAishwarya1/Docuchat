const Document = require('../models/Document');
const { generateEmbedding } = require('./generateEmbedding');

/**
 * Generates embeddings for every chunk in a document and saves them.
 */
async function embedDocument(documentId) {
  const document = await Document.findById(documentId);
  if (!document) throw new Error('Document not found');

  document.status = 'embedding';
  await document.save();

  for (const chunk of document.chunks) {
    chunk.embedding = await generateEmbedding(chunk.text);
  }

  document.status = 'ready';
  await document.save();

  return document;
}

module.exports = embedDocument;