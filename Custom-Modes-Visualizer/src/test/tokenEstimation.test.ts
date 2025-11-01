import { describe, it, expect } from 'vitest'
import { estimateTokens, formatTokenCount } from '../utils/tokenEstimation'

describe('tokenEstimation', () => {
  describe('estimateTokens', () => {
    it('should return 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0)
    })

    it('should return 0 for whitespace-only string', () => {
      expect(estimateTokens('   \n\t  ')).toBe(0)
    })

    it('should return 0 for null/undefined input', () => {
      expect(estimateTokens(null as any)).toBe(0)
      expect(estimateTokens(undefined as any)).toBe(0)
    })

    it('should estimate tokens using 4 chars per token approximation', () => {
      expect(estimateTokens('test')).toBe(1) // 4 chars = 1 token
      expect(estimateTokens('testing')).toBe(2) // 7 chars = 2 tokens (7/4 = 1.75 -> ceil to 2)
      expect(estimateTokens('This is a longer test string')).toBe(8) // 30 chars = ~7.5 -> ceil to 8
    })

    it('should trim whitespace before estimating', () => {
      expect(estimateTokens('  test  ')).toBe(1) // 'test' = 4 chars = 1 token
      expect(estimateTokens('\ntest\n')).toBe(1) // 'test' = 4 chars = 1 token
    })

    it('should handle special characters and unicode', () => {
      expect(estimateTokens('café')).toBe(1) // 4 chars = 1 token
      expect(estimateTokens('🚀 test')).toBe(2) // 7 chars = 2 tokens
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000) // 1000 chars
      expect(estimateTokens(longString)).toBe(250) // 1000/4 = 250 tokens
    })

    it('should round up fractional tokens', () => {
      expect(estimateTokens('abc')).toBe(1) // 3/4 = 0.75 -> ceil to 1
      expect(estimateTokens('abcde')).toBe(2) // 5/4 = 1.25 -> ceil to 2
      expect(estimateTokens('abcdefg')).toBe(2) // 7/4 = 1.75 -> ceil to 2
      expect(estimateTokens('abcdefgh')).toBe(2) // 8/4 = 2 -> 2
    })
  })

  describe('formatTokenCount', () => {
    it('should format 0 tokens correctly', () => {
      expect(formatTokenCount(0)).toBe('0 tokens')
    })

    it('should format small counts with "tokens"', () => {
      expect(formatTokenCount(1)).toBe('1 tokens')
      expect(formatTokenCount(999)).toBe('999 tokens')
    })

    it('should format large counts with "k tokens"', () => {
      expect(formatTokenCount(1000)).toBe('1.0k tokens')
      expect(formatTokenCount(1500)).toBe('1.5k tokens')
      expect(formatTokenCount(1234)).toBe('1.2k tokens')
      expect(formatTokenCount(1999)).toBe('2.0k tokens')
    })

    it('should round correctly for large numbers', () => {
      expect(formatTokenCount(1234)).toBe('1.2k tokens') // 1234/1000 = 1.234 -> 1.2
      expect(formatTokenCount(1250)).toBe('1.3k tokens') // 1250/1000 = 1.25 -> 1.3 (rounding up)
      expect(formatTokenCount(1249)).toBe('1.2k tokens') // 1249/1000 = 1.249 -> 1.2
    })
  })

  describe('integration: estimateTokens + formatTokenCount', () => {
    it('should work together for various inputs', () => {
      // Empty/whitespace
      expect(formatTokenCount(estimateTokens(''))).toBe('0 tokens')
      expect(formatTokenCount(estimateTokens('   '))).toBe('0 tokens')

      // Small prompts
      expect(formatTokenCount(estimateTokens('Hello world'))).toBe('3 tokens')
      expect(formatTokenCount(estimateTokens('This is a test'))).toBe('4 tokens')

      // Longer prompts
      const mediumPrompt = 'This is a longer prompt that should demonstrate the token counting functionality in a realistic scenario.'
      const tokenCount = estimateTokens(mediumPrompt)
      expect(tokenCount).toBeGreaterThan(10)
      expect(formatTokenCount(tokenCount)).toMatch(/^\d+ tokens$/)

      // Very long prompts
      const longPrompt = 'A'.repeat(4000) // ~1000 tokens
      expect(formatTokenCount(estimateTokens(longPrompt))).toMatch(/^\d+\.\dk tokens$/)
    })
  })
})