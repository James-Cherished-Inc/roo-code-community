/**
 * Utility functions for analyzing redundancies across multiple text prompts
 */

/**
 * Common English words to filter out from redundancy analysis
 */
export const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'what', 'which', 'who', 'when', 'where', 'why', 'how',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'as', 'if', 'then', 'else', 'when', 'while', 'because', 'although', 'though', 'after', 'before', 'once', 'since', 'until', 'whether',
  'about', 'above', 'across', 'against', 'along', 'among', 'around', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'down', 'during', 'except', 'from', 'inside', 'into', 'like', 'near', 'off', 'onto', 'out', 'outside', 'over', 'past', 'through', 'under', 'up', 'upon', 'within', 'without'
]);

/**
 * Configuration options for redundancy analysis
 */
export interface RedundancyConfig {
  /** Minimum word length to consider (default: 4) */
  minWordLength?: number;
  /** Minimum frequency to highlight (default: 2) */
  minFrequency?: number;
  /** Custom words to exclude from analysis */
  excludeWords?: Set<string>;
  /** Whether to ignore case (default: true) */
  caseSensitive?: boolean;
}

/**
 * Represents a word occurrence with frequency and mode distribution
 */
export interface WordOccurrence {
  word: string;
  frequency: number;
  modes: Set<string>;
  avgIntensity: number;
}

/**
 * Analyzes redundancies across multiple prompts
 */
export class RedundancyAnalyzer {
  private config: Required<RedundancyConfig>;

  constructor(config: RedundancyConfig = {}) {
    this.config = {
      minWordLength: 4,
      minFrequency: 2,
      excludeWords: new Set(),
      caseSensitive: false,
      ...config
    };
  }

  /**
   * Analyzes prompts and returns word frequency data
   */
  analyze(prompts: Array<{ content: string; id: string }>): Map<string, WordOccurrence> {
    const wordFrequencies = new Map<string, WordOccurrence>();

    prompts.forEach(({ content, id }) => {
      const words = this.extractWords(content);

      words.forEach(word => {
        if (!this.shouldIncludeWord(word)) return;

        const existing = wordFrequencies.get(word);
        if (existing) {
          existing.frequency++;
          existing.modes.add(id);
        } else {
          wordFrequencies.set(word, {
            word,
            frequency: 1,
            modes: new Set([id]),
            avgIntensity: 0
          });
        }
      });
    });

    // Filter by minimum frequency and calculate intensity
    const filteredResults = new Map<string, WordOccurrence>();
    wordFrequencies.forEach((occurrence, word) => {
      if (occurrence.frequency >= this.config.minFrequency) {
        occurrence.avgIntensity = occurrence.modes.size / prompts.length;
        filteredResults.set(word, occurrence);
      }
    });

    return filteredResults;
  }

  /**
   * Extracts words from text content
   */
  private extractWords(text: string): string[] {
    const matches = text.match(/\b\w+\b/g);
    if (!matches) return [];

    return matches.map(word =>
      this.config.caseSensitive ? word : word.toLowerCase()
    );
  }

  /**
   * Determines if a word should be included in analysis
   */
  private shouldIncludeWord(word: string): boolean {
    // Check length
    if (word.length < this.config.minWordLength) return false;

    // Check common words
    if (COMMON_WORDS.has(word)) return false;

    // Check custom exclusions
    if (this.config.excludeWords.has(word)) return false;

    return true;
  }

  /**
   * Gets redundancy statistics
   */
  getStats(analysis: Map<string, WordOccurrence>, totalPrompts: number): {
    totalWords: number;
    redundantWords: number;
    redundancyPercentage: number;
    mostFrequent: Array<{ word: string; frequency: number }>;
  } {
    const words = Array.from(analysis.values());
    const totalWords = words.reduce((sum, w) => sum + w.frequency, 0);
    const redundantWords = words.length;

    return {
      totalWords,
      redundantWords,
      redundancyPercentage: totalPrompts > 0 ? (redundantWords / totalWords) * 100 : 0,
      mostFrequent: words
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
        .map(w => ({ word: w.word, frequency: w.frequency }))
    };
  }
}

/**
 * Default analyzer instance for convenience
 */
export const defaultAnalyzer = new RedundancyAnalyzer();

/**
 * Quick analysis function using default settings
 */
export function analyzeRedundancies(
  prompts: Array<{ content: string; id: string }>,
  config?: RedundancyConfig
): {
  analysis: Map<string, WordOccurrence>;
  stats: ReturnType<RedundancyAnalyzer['getStats']>;
} {
  const analyzer = config ? new RedundancyAnalyzer(config) : defaultAnalyzer;
  const analysis = analyzer.analyze(prompts);
  const stats = analyzer.getStats(analysis, prompts.length);

  return { analysis, stats };
}