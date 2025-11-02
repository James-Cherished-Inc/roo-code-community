import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ModeDetail from '../components/ModeDetail'
import { ModeProvider } from '../context/ModeContext'
import type { Mode } from '../types'

// Mock the context
const mockUpdateMode = vi.fn()

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <ModeProvider>
      {component}
    </ModeProvider>
  )
}

describe('ModeDetail', () => {
  const mockMode: Mode = {
    slug: 'test-mode',
    name: 'Test Mode',
    description: 'A test mode for testing',
    usage: 'Used for testing purposes',
    prompt: 'This is a test prompt that should be counted for tokens',
    family: 'default'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear sessionStorage before each test
    sessionStorage.clear()
  })

  describe('token count display', () => {
    it('should display token count for the prompt field', () => {
      renderWithContext(<ModeDetail mode={mockMode} />)

      // Check that token count is displayed in the prompt label
      const promptLabel = screen.getByText(/System Prompt/)
      expect(promptLabel).toBeInTheDocument()

      // The token count should be displayed alongside "System Prompt"
      // Based on the prompt "This is a test prompt that should be counted for tokens"
      // Length: 65 characters -> 65/4 = 16.25 -> ceil to 17 tokens
      expect(screen.getByText('(17 tokens)')).toBeInTheDocument()
    })

    it('should display 0 tokens for empty prompt', () => {
      const emptyPromptMode = { ...mockMode, prompt: '' }
      renderWithContext(<ModeDetail mode={emptyPromptMode} />)

      expect(screen.getByText('(0 tokens)')).toBeInTheDocument()
    })

    it('should display 0 tokens for whitespace-only prompt', () => {
      const whitespacePromptMode = { ...mockMode, prompt: '   \n\t  ' }
      renderWithContext(<ModeDetail mode={whitespacePromptMode} />)

      expect(screen.getByText('(0 tokens)')).toBeInTheDocument()
    })

    it('should display formatted token count for large prompts', () => {
      const longPrompt = 'A'.repeat(4000) // ~1000 tokens
      const longPromptMode = { ...mockMode, prompt: longPrompt }
      renderWithContext(<ModeDetail mode={longPromptMode} />)

      // 4000 chars / 4 = 1000 tokens -> "1.0k tokens"
      expect(screen.getByText('(1.0k tokens)')).toBeInTheDocument()
    })

    it('should update token count when prompt changes', async () => {
      const user = userEvent.setup()
      renderWithContext(<ModeDetail mode={mockMode} />)

      // Initial count should be 17 tokens
      expect(screen.getByText('(17 tokens)')).toBeInTheDocument()

      // Double-click the prompt to enter edit mode
      const promptDisplay = screen.getByText(mockMode.prompt)
      await user.dblClick(promptDisplay)

      // Find the textarea and change the prompt
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      await user.clear(textarea)
      await user.type(textarea, 'Short prompt')

      // Save the edit (Ctrl+Enter)
      await user.type(textarea, '{ctrl}{enter}')

      // Verify the update was called with new prompt
      expect(mockUpdateMode).toHaveBeenCalledWith(mockMode.slug, {
        prompt: 'Short prompt'
      })
    })

    it('should handle special characters and unicode in prompts', () => {
      const unicodePromptMode = { ...mockMode, prompt: 'Test with émojis 🚀 and spëcial chârs' }
      renderWithContext(<ModeDetail mode={unicodePromptMode} />)

      // Should still calculate based on character count
      // "Test with émojis 🚀 and spëcial chârs" = 37 chars -> ceil(37/4) = 10 tokens
      expect(screen.getByText('(10 tokens)')).toBeInTheDocument()
    })

    it('should display token count consistently across renders', () => {
      const { rerender } = renderWithContext(<ModeDetail mode={mockMode} />)

      expect(screen.getByText('(17 tokens)')).toBeInTheDocument()

      // Rerender with same mode
      rerender(
        <ModeProvider>
          <ModeDetail mode={mockMode} />
        </ModeProvider>
      )

      // Should still show same token count
      expect(screen.getByText('(17 tokens)')).toBeInTheDocument()
    })
  })

  describe('token count edge cases', () => {
    it('should handle null/undefined prompts gracefully', () => {
      const nullPromptMode = { ...mockMode, prompt: null as any }
      expect(() => renderWithContext(<ModeDetail mode={nullPromptMode} />)).not.toThrow()

      const undefinedPromptMode = { ...mockMode, prompt: undefined as any }
      expect(() => renderWithContext(<ModeDetail mode={undefinedPromptMode} />)).not.toThrow()
    })

    it('should handle very long prompts without performance issues', () => {
      const veryLongPrompt = 'word '.repeat(1000) // Creates a long but realistic prompt
      const longPromptMode = { ...mockMode, prompt: veryLongPrompt }

      const startTime = Date.now()
      renderWithContext(<ModeDetail mode={longPromptMode} />)
      const endTime = Date.now()

      // Should render quickly (< 100ms)
      expect(endTime - startTime).toBeLessThan(100)

      // Should display the token count
      expect(screen.getByText(/(\d+|\d+\.\dk) tokens/)).toBeInTheDocument()
    })
  })

  describe('integration with mode updates', () => {
    it('should recalculate tokens when mode is updated via onUpdate prop', () => {
      const onUpdate = vi.fn()
      const { rerender } = renderWithContext(<ModeDetail mode={mockMode} onUpdate={onUpdate} />)

      expect(screen.getByText('(17 tokens)')).toBeInTheDocument()

      // Simulate external mode update
      const updatedMode = { ...mockMode, prompt: 'New shorter prompt' }
      rerender(
        <ModeProvider>
          <ModeDetail mode={updatedMode} onUpdate={onUpdate} />
        </ModeProvider>
      )

      // Should show new token count: "New shorter prompt" = 19 chars -> ceil(19/4) = 5 tokens
      expect(screen.getByText('(5 tokens)')).toBeInTheDocument()
    })
  })
})