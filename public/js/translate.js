document.getElementById('translateBtn').addEventListener('click', async function() {
    const chineseTextRaw = document.getElementById('chineseText').value;
    // Split the input text by line breaks to create an array of lines
    const chineseTextLines = chineseTextRaw.split('\n').filter(line => line.trim() !== ''); // Ensure empty lines are not sent
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    const characterLimitWarning = document.getElementById('characterLimitWarning');
    const englishTextArea = document.getElementById('englishText');
    const retryAfterIndicator = document.getElementById('retryAfterIndicator'); // Display retry after message

    characterLimitWarning.style.display = 'none';
    retryAfterIndicator.style.display = 'none'; // Hide retry after message initially

    // Calculate total characters across all lines to check against the limit
    const totalCharacters = chineseTextLines.reduce((acc, line) => acc + line.length, 0);
    // Show warning if character limit exceeded
    if (totalCharacters > 1000) {
        characterLimitWarning.style.display = 'block';
        console.log('Character limit exceeded.');
        return; // Stop further processing
    }

    loadingIndicator.style.display = 'block';

    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send each line as a separate entry in an array within the JSON payload
            body: JSON.stringify({ chineseText: chineseTextLines }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to fetch translation:', errorData.error || response.statusText);
            if (response.status === 429) {
                // Handle rate limit exceeded error
                const retryAfter = response.headers.get('Retry-After');
                retryAfterIndicator.innerText = `Rate limit exceeded. Please try again after ${retryAfter || 'some time'}.`; // Use a default message if retryAfter is not provided
                retryAfterIndicator.style.display = 'block';
            } else {
                englishTextArea.value = `Translation failed: ${errorData.error || response.statusText}. Please try again.`;
            }
            loadingIndicator.style.display = 'none';
            return;
        }

        const data = await response.json();
        // Display the translated text with paragraph breaks preserved
        englishTextArea.value = data.translatedText.replace(/\\n/g, '\n'); // Adjusting to correctly display paragraph breaks
        console.log('Translation successful.');
    } catch (error) {
        console.error('Error during translation:', error);
        console.error(error.stack);
        alert('An error occurred while translating. Please try again. ' + error.message);
    } finally {
        loadingIndicator.style.display = 'none';
    }
});