let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    // dynamic import because @xenova/transformers is an ES module
    const { pipeline } = await import('@xenova/transformers');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded: all-MiniLM-L6-v2');
  }
  return embedder;
}

async function generateEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data); // convert tensor -> plain JS array
}

module.exports = { generateEmbedding, getEmbedder };