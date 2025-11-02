/**
 * Utility functions for estimating token counts in text
 */

/**
 * Estimates the number of tokens in a given text string.
 * Uses a simple approximation of ~4 characters per token for English text.
 * This is a rough estimate and actual token counts may vary by model and tokenizer.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Remove extra whitespace and normalize
  const normalized = text.trim();

  // Simple approximation: ~4 characters per token
  // This is a rough estimate commonly used for GPT models
  const charsPerToken = 4;
  const estimatedTokens = Math.ceil(normalized.length / charsPerToken);

  return estimatedTokens;

  return estimatedTokens;
}

/**
 * Formats a token count for display
 */
export function formatTokenCount(count: number): string {
  if (count === 0) return '0 tokens';
  if (count < 1000) return `${count} tokens`;
  return `${(count / 1000).toFixed(1)}k tokens`;
}