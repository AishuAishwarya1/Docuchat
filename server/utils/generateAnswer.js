const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateAnswer(question, retrievedChunks) {
  if (retrievedChunks.length === 0) {
    return {
      answer: "I couldn't find anything relevant to that question in your uploaded documents.",
      sources: [],
    };
  }

  const contextBlock = retrievedChunks
    .map((chunk, i) => `[Source ${i + 1}: ${chunk.originalName}]\n${chunk.context}`)
    .join('\n\n');

  const systemPrompt = `You are a helpful assistant that answers questions using ONLY the provided context from the user's documents.

Rules:
- Only use information from the context below. Do not use outside knowledge.
- If the context doesn't contain the answer, say so clearly — do not guess.
- Cite which source number(s) you used, like [Source 1].
- Be concise and direct.`;

  const userMessage = `Context:\n${contextBlock}\n\nQuestion: ${question}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const answer = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return {
      answer,
      sources: retrievedChunks.map((c) => ({ originalName: c.originalName, score: c.score })),
    };
  } catch (err) {
    // log full detail for debugging -> this is what actually tells you WHAT went wrong
    console.error('LLM generation failed:', {
      status: err.status,
      type: err.error?.error?.type,
      message: err.error?.error?.message || err.message,
    });
    // 401 -> bad/missing API key
    if (err.status === 401) {
      return {
        answer: 'The AI service is not configured correctly. Please contact support.',
        sources: [],
      };
    }
    // 400 with invalid_request_error -> most commonly a billing/credit issue on Anthropic's side
    if (err.status === 400 && err.error?.error?.type === 'invalid_request_error') {
      return {
        answer: 'The AI service is temporarily unavailable (billing issue). Please try again later.',
        sources: [],
      };
    }
    // 429 -> rate limited, either per-request or account-level
    if (err.status === 429) {
      return {
        answer: "I'm receiving too many requests right now. Please wait a moment and try again.",
        sources: [],
      };
    }
    // 529 -> Anthropic's servers are overloaded (distinct from your own rate limit)
    if (err.status === 529) {
      return {
        answer: 'The AI service is experiencing high demand right now. Please try again in a moment.',
        sources: [],
      };
    }
    // 500/503 -> Anthropic-side server error, not your fault
    if (err.status >= 500) {
      return {
        answer: 'The AI service is having issues right now. Please try again shortly.',
        sources: [],
      };
    }
    return {
      answer: 'Something went wrong generating a response. Please try again.',
      sources: [],
    };
  }
}

module.exports = generateAnswer;