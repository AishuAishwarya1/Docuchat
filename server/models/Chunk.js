const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
    charStart: {
      type: Number,
      default: -1,
    },
    charEnd: {
      type: Number,
      default: -1,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chunk', chunkSchema);