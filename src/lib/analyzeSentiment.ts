import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export function analyzeSentiment(text: string): {
  score: number;
  label: "positive" | "negative" | "neutral";
} {
  const result = sentiment.analyze(text);

  // Determine sentiment label based on score
  let label: "positive" | "negative" | "neutral";
  if (result.score > 0) {
    label = "positive";
  } else if (result.score < 0) {
    label = "negative";
  } else {
    label = "neutral";
  }

  return {
    score: result.score,
    label,
  };
}
