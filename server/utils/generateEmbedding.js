let embedder = null;

/**
 * Lazily loads the embedding pipeline once, reuses it for all calls.
 * Loading the model is slow (~seconds) — we don't want to reload it
 * on every single chunk.
 */
async function getEmbedder() {
  if (!embedder) {
    // dynamic import because @xenova/transformers is an ES module
    const { pipeline } = await import('@xenova/transformers');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded: all-MiniLM-L6-v2');
  }
  return embedder;
}

/**
 * Generates a 384-dimension embedding vector for a piece of text
 * -> same output shape as sent_embedding.encode(text) in your Python notes
 */
async function generateEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data); // convert tensor -> plain JS array
}

module.exports = { generateEmbedding, getEmbedder };