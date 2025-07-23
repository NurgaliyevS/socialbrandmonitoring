export function extractSentenceWithKeyword(
  content: string,
  keyword: string
): string {
  if (!content || !keyword) return content;

  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  // Find the position of the keyword
  const keywordIndex = lowerContent.indexOf(lowerKeyword);
  if (keywordIndex === -1) return content;

  // Find sentence boundaries (period, exclamation mark, question mark)
  const sentenceEndings = [".", "!", "?", "\n"];

  // Find the start of the sentence (look backwards for sentence endings)
  let sentenceStart = 0;
  for (let i = keywordIndex; i >= 0; i--) {
    if (sentenceEndings.includes(content[i])) {
      sentenceStart = i + 1;
      break;
    }
  }

  // Find the end of the sentence (look forwards for sentence endings)
  let sentenceEnd = content.length;
  for (let i = keywordIndex; i < content.length; i++) {
    if (sentenceEndings.includes(content[i])) {
      sentenceEnd = i + 1;
      break;
    }
  }

  // Extract the sentence and trim whitespace
  const sentence = content.slice(sentenceStart, sentenceEnd).trim();

  // Make the keyword bold by wrapping it in HTML tags
  const boldSentence = sentence.replace(
    new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
    "<strong>$1</strong>"
  );

  // If sentence is too long (more than 300 chars), truncate it
  if (boldSentence.length > 300) {
    return boldSentence.substring(0, 297) + "...";
  }

  return boldSentence || content.substring(0, 200) + "...";
}
