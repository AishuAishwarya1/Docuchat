const { generateEmbedding } = require('../utils/generateEmbedding');

async function run() {
  const text1 = 'Casual leave can be availed for a maximum of 3 days in a month.';
  const text2 = 'Employees are allowed up to three days of casual leave per month.';
  const text3 = 'Office timing starts at 9:30 AM.';

  console.log('Generating embeddings...\n');

  const emb1 = await generateEmbedding(text1);
  const emb2 = await generateEmbedding(text2);
  const emb3 = await generateEmbedding(text3);

  console.log('Embedding dimension:', emb1.length); // should be 384
  console.log('First 5 values of emb1:', emb1.slice(0, 5));

  // cosine similarity function to sanity-check semantic closeness
  function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  console.log('\nSimilarity (text1 vs text2 — similar meaning):', cosineSimilarity(emb1, emb2));
  console.log('Similarity (text1 vs text3 — different topic):', cosineSimilarity(emb1, emb3));
}

run();