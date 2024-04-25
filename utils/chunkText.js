function chunkText(text, chunkSize) {
  if (typeof text !== 'string') {
    const errorMessage = 'Error: Input text must be a string.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    const errorMessage = 'Error: Chunk size must be a positive number.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Adding a hard limit for the input size to prevent performance issues
  const MAX_INPUT_SIZE = 1000;
  if (text.length > MAX_INPUT_SIZE) {
    const errorMessage = `Error: Input exceeds the maximum allowed size of ${MAX_INPUT_SIZE} characters.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  console.log(`Text chunked into ${chunks.length} parts.`);
  return chunks;
}

module.exports = chunkText;