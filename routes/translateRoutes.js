const express = require('express');
const chunkText = require('../utils/chunkText');
const { translateTextChunk } = require('../services/translationService');
const router = express.Router();

router.post('/translate', async (req, res) => {
  if (typeof req.body !== 'object') {
    console.error('Invalid request body. Expected JSON.');
    return res.status(400).json({ error: 'Invalid request. Please provide the request in JSON format.' });
  }

  if (!req.body.hasOwnProperty('chineseText')) {
    console.error('Missing Chinese text for translation.');
    return res.status(400).json({ error: 'Missing Chinese text for translation.' });
  }

  let { chineseText } = req.body;

  // Ensure chineseText is always an array
  if (!Array.isArray(chineseText)) {
    console.error('Invalid type for chineseText. Expected an array. Converting to array.');
    chineseText = [chineseText]; // Convert to array if not already
  }

  const totalCharacters = chineseText.reduce((acc, line) => acc + line.length, 0);
  if (totalCharacters > 1000) {
    console.error('Input exceeds the maximum character limit.');
    return res.status(400).json({ error: 'You have exceeded the maximum number of characters.' });
  }

  try {
    let translatedText = [];
    for (const line of chineseText) {
      const chunks = chunkText(line, 25);
      let translatedLineChunks = [];
      for (const chunk of chunks) {
        try {
          const translation = await translateTextChunk(chunk);
          if (translation !== null && translation !== undefined) {
            translatedLineChunks.push(translation);
          } else {
            console.error('Translation returned null or undefined for a chunk.');
            translatedLineChunks.push(''); // Append an empty string if translation failed for a chunk
          }
        } catch (error) {
          console.error('Error during translation:', error.message);
          console.error(error.stack);
          if (error.response && error.response.status === 429) {
            console.error('Translation service rate limit exceeded:', error.message);
            return res.status(429).json({ error: 'Translation service rate limit exceeded. Please try again later.' });
          } else {
            return res.status(500).json({ error: 'Error processing your request during translation.' });
          }
        }
      }
      translatedText.push(translatedLineChunks.join('')); // Join the chunks to form a complete translated line
    }
    // Directly join translatedText with line breaks as in the original input
    res.json({ originalText: chineseText.join('\n'), translatedText: translatedText.join('\n') });
  } catch (error) {
    console.error('Error processing translation request:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Error processing your request.' });
  }
});

module.exports = router;