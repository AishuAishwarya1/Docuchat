const { chunkText } = require('../utils/chunkText');

const sampleText = `
Leave Policy Overview

Employees are entitled to 18 days of paid leave per calendar year. Casual leave can be availed for a maximum of 3 days in a month. Employees must apply for leave at least 2 days in advance, except in emergencies.

Sick leave requires a medical certificate if taken for more than 2 consecutive days. Unused casual leave does not carry forward to the next year.

Office Timing Policy

Standard working hours are 9:30 AM to 6:30 PM, Monday to Friday. Employees are expected to log in within a 15-minute grace window. Remote work requests must be approved by the reporting manager at least one day in advance.
`;

const chunks = chunkText(sampleText, { chunkSize: 100, chunkOverlap: 15 });

console.log(`\nTotal chunks created: ${chunks.length}\n`);
chunks.forEach((chunk) => {
  console.log(`--- Chunk ${chunk.index + 1} (${chunk.tokenCount} tokens, chars ${chunk.charStart}-${chunk.charEnd}) ---`);
  console.log(chunk.text);
  console.log();
});