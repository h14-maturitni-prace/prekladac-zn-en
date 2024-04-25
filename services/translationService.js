const CircuitBreaker = require('./circuitBreaker'); // Make sure this import statement exists; if not, add it.
const axios = require('axios');
require('dotenv').config();
const circuitBreaker = new CircuitBreaker(axios, {
  failureThreshold: 5,
  timeout: 60000 // Adjust these options as needed.
});

/**
 * Translates a text chunk from Chinese to English using the Helsinki-NLP model.
 * Includes a check for the Circuit Breaker's RATE_LIMITED state.
 * 
 * @param {string} textChunk - The text chunk to translate.
 * @return {Promise<string>} The translated text chunk.
 */
async function translateTextChunk(textChunk) {
  const apiUrl = 'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-zh-en';
  
  // Check if the Circuit Breaker is in the RATE_LIMITED state and delay the request if necessary.
  if (circuitBreaker.state === "RATE_LIMITED" && circuitBreaker.estimatedOpenTime > Date.now()) {
    const delayTime = circuitBreaker.estimatedOpenTime - Date.now();
    console.log(`Delaying translation request for ${delayTime}ms due to rate limiting.`);
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }
  
  try {
    const response = await circuitBreaker.callService({
      method: 'post',
      url: apiUrl,
      data: { inputs: textChunk },
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      }
    });

    if (response.status === 200 && response.data && response.data.length > 0 && response.data[0].hasOwnProperty('translation_text')) {
      console.log(`Translation successful for chunk: ${textChunk.substring(0, 10)}...`);
      let processedTranslation = response.data[0].translation_text;
      processedTranslation = processedTranslation.replace(/(\.|\?)(?![\s$])/g, "$1 ");
      processedTranslation += '\n';
      console.log(`Post-processing applied to translation chunk: ${textChunk.substring(0, 10)}...`);
      return processedTranslation;
    } else {
      console.warn(`Translation service returned an undefined response for chunk: ${textChunk.substring(0, 10)}...`);
      return 'Busy, try again later.';
    }
  } catch (error) {
    console.error('Error during translation:', error.message);
    console.error(error.stack);
    if (error.response && error.response.status === 429) {
      console.warn('Translation service rate limit exceeded. Returning "Busy, try again later."');
      return 'Busy, try again later.';
    } else {
      throw error; // Ensure that errors are propagated up for handling elsewhere
    }
  }
}

module.exports = { translateTextChunk };