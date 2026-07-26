const mongoose = require('mongoose');
const Chunk = require('../models/Chunk');
const Document = require('../models/Document');
const { generateEmbedding } = require('./generateEmbedding');

async function retrieveChunks(userId, query, topK = 5, threshold = 0.6, contextWindow = 1) {
  const queryEmbedding = await generateEmbedding(query);

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: 'chunk_vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK,
        filter: { user: new mongoose.Types.ObjectId(userId) },
      },
    },
    {
      $project: {
        document: 1,
        text: 1,
        chunkIndex: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  const filtered = results.filter((r) => r.score >= threshold);

  const expanded = await Promise.all(
    filtered.map(async (match) => {
      const doc = await Document.findById(match.document).select('originalName');

      const neighbors = await Chunk.find({
        document: match.document,
        chunkIndex: {
          $gte: match.chunkIndex - contextWindow,
          $lte: match.chunkIndex + contextWindow,
        },
      }).sort({ chunkIndex: 1 });

      return {
        originalName: doc?.originalName,
        score: match.score,
        context: neighbors.map((c) => c.text).join(' '),
      };
    })
  );

  return expanded;
}

module.exports = retrieveChunks;