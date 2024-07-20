// src/utils/textProcessing.js

/**
 * Segments a text into logical paragraphs, handling bullet points and paragraph breaks.
 * @param {string} text - The input text to be segmented.
 * @returns {Array<{content: string, timestamp: string}>} An array of segment objects.
 */
export const segmentTranscript = (text) => {
    const lines = text.split(/\r?\n/);
    const segments = [];
    let currentSegment = [];
    let inBulletList = false;
  
    const isBulletPoint = (line) => /^[\s]*[-•*]\s/.test(line.trim());
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
  
      if (isBulletPoint(line)) {
        // Start of a bullet point or continuation of a bullet list
        if (!inBulletList && currentSegment.length) {
          segments.push(currentSegment.join('\n'));
          currentSegment = [];
        }
        inBulletList = true;
        currentSegment.push(line);
      } else if (inBulletList && !isBulletPoint(nextLine) && nextLine.trim()) {
        // End of a bullet list
        currentSegment.push(line);
        segments.push(currentSegment.join('\n'));
        currentSegment = [];
        inBulletList = false;
      } else if (!line.trim()) {
        // Empty line - potential paragraph break
        if (currentSegment.length) {
          segments.push(currentSegment.join('\n'));
          currentSegment = [];
        }
        inBulletList = false;
      } else {
        // Regular line
        if (!inBulletList && !currentSegment.length && segments.length) {
          // Start of a new paragraph after an empty line
          segments.push(currentSegment.join('\n'));
          currentSegment = [];
        }
        currentSegment.push(line);
      }
    }
  
    // Add any remaining content as the last segment
    if (currentSegment.length) {
      segments.push(currentSegment.join('\n'));
    }
  
    // Process segments: trim whitespace and filter out empty segments
    return segments
      .map(segment => ({
        content: segment.trim(),
        timestamp: ''
      }))
      .filter(segment => segment.content);
  };

export const generateGist = (content) => {
  // Simple gist generation: take the first 5-7 words
  const words = content.split(/\s+/);
  return words.slice(0, Math.min(7, Math.max(5, Math.floor(words.length / 4)))).join(' ') + '...';
};

export const generateReflectionPrompt = (content) => {
  if (content.length > 200) {
    const prompts = [
      "What's the main point here?",
      "How does this relate to the overall topic?",
      "Any key terms or concepts introduced?",
      "What questions does this raise?",
      "How might this information be applied?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  return '';
};