/**
 * Recursively splits text into chunks using a hierarchy of separators,
 * same idea as: paragraph breaks -> line breaks -> sentences -> words
 */
function recursiveChunk(text, chunkSize = 500, separators = ['\n\n', '\n', '. ', ' ']) {
  if (text.length <= chunkSize) {
    return [text.trim()].filter(Boolean);
  }

  // no separators left to try -> hard split by character count
  if (separators.length === 0) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize).trim());
    }
    return chunks.filter(Boolean);
  }

  const [sep, ...restSeparators] = separators;
  const parts = text.split(sep);

  const chunks = [];
  let currentChunk = '';

  for (const part of parts) {
    const candidate = currentChunk ? currentChunk + sep + part : part;

    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
    } else {
      if (currentChunk) {
        // currentChunk might still be too big if a single part was huge -> recurse
        if (currentChunk.length > chunkSize) {
          chunks.push(...recursiveChunk(currentChunk, chunkSize, restSeparators));
        } else {
          chunks.push(currentChunk.trim());
        }
      }
      currentChunk = part;
    }
  }

  if (currentChunk) {
    if (currentChunk.length > chunkSize) {
      chunks.push(...recursiveChunk(currentChunk, chunkSize, restSeparators));
    } else {
      chunks.push(currentChunk.trim());
    }
  }

  return chunks.filter(Boolean);
}

/**
 * Adds overlap between chunks so context isn't lost at chunk boundaries
 * -> same idea as your "overlap chunking" from Day 11 notes
 */
function addOverlap(chunks, overlapChars = 50) {
  const overlapped = [];

  for (let i = 0; i < chunks.length; i++) {
    if (i === 0) {
      overlapped.push(chunks[i]);
    } else {
      const prevTail = chunks[i - 1].slice(-overlapChars);
      overlapped.push(prevTail + ' ' + chunks[i]);
    }
  }

  return overlapped;
}

function chunkText(text, chunkSize = 500, overlapChars = 50) {
  const rawChunks = recursiveChunk(text, chunkSize);
  return addOverlap(rawChunks, overlapChars);
}

module.exports = { chunkText, recursiveChunk, addOverlap };