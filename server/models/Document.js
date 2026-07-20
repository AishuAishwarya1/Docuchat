const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    chunks: [
      {
        text: { type: String, required: true },
        chunkIndex: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['processing', 'chunked', 'embedding', 'ready', 'failed'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);