const DEFAULT_SEPARATORS = [
  /\n(?=#{1,6}\s)/,       // before markdown headers (keeps header w/ its content)
  '\n\n',                  // paragraph breaks
  '\n',                    // line breaks
  /(?<=[.!?])\s+/,          // sentence boundaries (keeps punctuation attached)
  ' ',                      // words
];

// ---- default (approximate) tokenizer ----------------------------------

function approxTokenCount(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// ---- split text into pieces, always keeping the delimiter -------------

function splitKeepDelimiter(text, sep) {
  if (typeof sep === 'string') {
    if (sep === '') return text.split('');
    const parts = text.split(sep);
    return parts.map((p, i) => (i < parts.length - 1 ? p + sep : p)).filter((p) => p.length > 0);
  }

  // RegExp separator: split, but re-attach the matched delimiter text to
  // the piece that precedes it, so nothing is lost.
  const flags = sep.flags.includes('g') ? sep.flags : sep.flags + 'g';
  const re = new RegExp(sep.source, flags);
  const result = [];
  let lastIndex = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    result.push(text.slice(lastIndex, match.index) + match[0]);
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) re.lastIndex++; // avoid infinite loop on zero-width matches
  }
  result.push(text.slice(lastIndex));
  return result.filter((p) => p.length > 0);
}

// ---- hard fallback: slice by tokens when no separator works -----------

function sliceByTokenBudget(text, maxTokens, tokenizer) {
  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (tokenizer(remaining) <= maxTokens) {
      chunks.push(remaining);
      break;
    }
    // binary search for the largest prefix that fits the token budget
    let lo = 1;
    let hi = remaining.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (tokenizer(remaining.slice(0, mid)) <= maxTokens) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    chunks.push(remaining.slice(0, lo));
    remaining = remaining.slice(lo);
  }

  return chunks;
}

// ---- core recursive splitter -------------------------------------------

function recursiveChunk(text, maxTokens, separators, tokenizer) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (tokenizer(trimmed) <= maxTokens) return [trimmed];

  if (separators.length === 0) {
    return sliceByTokenBudget(trimmed, maxTokens, tokenizer).map((c) => c.trim()).filter(Boolean);
  }

  const [sep, ...restSeparators] = separators;
  const parts = splitKeepDelimiter(text, sep);

  const chunks = [];
  let current = '';

  const flush = () => {
    if (!current) return;
    if (tokenizer(current) > maxTokens) {
      chunks.push(...recursiveChunk(current, maxTokens, restSeparators, tokenizer));
    } else {
      const t = current.trim();
      if (t) chunks.push(t);
    }
    current = '';
  };

  for (const part of parts) {
    const candidate = current + part;

    if (tokenizer(candidate) <= maxTokens) {
      current = candidate;
      continue;
    }

    // candidate too big: flush what we had, then decide what to do with `part`
    flush();

    if (tokenizer(part) > maxTokens) {
      // a single fragment is itself oversized -> recurse on it directly
      chunks.push(...recursiveChunk(part, maxTokens, restSeparators, tokenizer));
    } else {
      current = part;
    }
  }
  flush();

  return chunks;
}

// ---- boundary-safe overlap ---------------------------------------------

function trailingOverlapText(text, overlapTokens, tokenizer) {
  if (overlapTokens <= 0) return '';
  const words = text.split(/\s+/).filter(Boolean);
  let acc = '';
  for (let i = words.length - 1; i >= 0; i--) {
    const candidate = acc ? `${words[i]} ${acc}` : words[i];
    if (tokenizer(candidate) > overlapTokens) break;
    acc = candidate;
  }
  return acc;
}

function addOverlap(chunks, overlapTokens, tokenizer) {
  return chunks.map((chunk, i) => {
    if (i === 0 || overlapTokens <= 0) return chunk;
    const overlap = trailingOverlapText(chunks[i - 1], overlapTokens, tokenizer);
    return overlap ? `${overlap} ${chunk}` : chunk;
  });
}

// ---- public API -----------------------------------------------------

/**
 * @param {string} text
 * @param {object} [options]
 * @param {number} [options.chunkSize=200]     target size per chunk, in tokens
 * @param {number} [options.chunkOverlap=30]    overlap between consecutive chunks, in tokens
 * @param {(text:string)=>number} [options.tokenizer]  token counter; defaults to a ~4-chars/token estimate
 * @param {Array<string|RegExp>} [options.separators]  separator hierarchy, most meaningful first
 * @returns {{text:string, index:number, tokenCount:number, charStart:number, charEnd:number}[]}
 */
function chunkText(text, options = {}) {
  const {
    chunkSize = 200,
    chunkOverlap = 30,
    tokenizer = approxTokenCount,
    separators = DEFAULT_SEPARATORS,
  } = options;

  if (chunkOverlap >= chunkSize) {
    throw new Error('chunkOverlap must be smaller than chunkSize');
  }

  // budget overlap into the target size so final chunks land near chunkSize,
  // not chunkSize + overlap
  const effectiveSize = chunkSize - chunkOverlap;

  const rawChunks = recursiveChunk(text, effectiveSize, separators, tokenizer);
  const overlapped = addOverlap(rawChunks, chunkOverlap, tokenizer);

  // attach metadata, tracking offsets against the ORIGINAL text where possible
  let searchFrom = 0;
  return overlapped.map((chunkStr, i) => {
    const rawChunk = rawChunks[i];
    const idx = text.indexOf(rawChunk, searchFrom);
    const charStart = idx === -1 ? -1 : idx;
    const charEnd = idx === -1 ? -1 : idx + rawChunk.length;
    if (idx !== -1) searchFrom = idx + Math.max(1, rawChunk.length - chunkOverlap);

    return {
      text: chunkStr,
      index: i,
      tokenCount: tokenizer(chunkStr),
      charStart,
      charEnd,
    };
  });
}

module.exports = { chunkText, recursiveChunk, addOverlap, approxTokenCount, DEFAULT_SEPARATORS };