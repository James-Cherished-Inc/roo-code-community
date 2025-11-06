import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ModeProvider } from '../context/ModeContext'
import PromptBuilder from '../components/PromptBuilder'
import type { Mode } from '../types'

describe('Custom Features End-to-End Workflow', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  // Mock clipboard API to avoid external dependencies
  const mockWriteText = vi.fn()
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  })

  const testModes: Mode[] = [
    {
      slug: 'architect',
      name: '🏗️ Architect',
      description: 'Plans system architecture',
      usage: 'Use for planning complex tasks',
      prompt: 'You are the Architect specialist...',
      family: 'cherished'
    },
  ]

  it('should create custom feature, enable in prompt builder, and verify in generated prompt', async () => {
    render(
      <ModeProvider>
        <PromptBuilder modes={testModes} />
      </ModeProvider>
    )

    // Step 1: Create a custom feature
    // Open custom feature manager
    const manageButton = screen.getByText('Manage Custom Features')
    await user.click(manageButton)

    // Click add feature button
    const addButton = screen.getByText('Add Feature')
    await user.click(addButton)

    // Fill out the modal form
    const nameInput = screen.getByLabelText('Feature Name *')
    const descriptionInput = screen.getByLabelText('Description *')
    const categorySelect = screen.getByLabelText('Category *')

    await user.type(nameInput, 'Test Custom Feature')
    await user.type(descriptionInput, 'A custom feature for end-to-end testing')
    await user.selectOptions(categorySelect, 'communication-style')

    // Save the feature
    const createButton = screen.getByText('Create')
    await user.click(createButton)

    // Step 2: Enable feature in prompt builder
    // Select a mode
    const architectButton = screen.getByText('🏗️ Architect')
    await user.click(architectButton)

    // Find and enable the custom feature checkbox
    const customFeatureCheckbox = screen.getByRole('checkbox', { name: /Test Custom Feature/ })
    await user.click(customFeatureCheckbox)

    // Step 3: Generate and verify prompt
    const generateButton = screen.getByText('🚀 Generate Prompt')
    await user.click(generateButton)

    // Wait for prompt generation and verify content
    await waitFor(() => {
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      expect(preElement).toBeInTheDocument()
      expect(preElement?.textContent).toContain('--- Feature Enhancements ---')
      expect(preElement?.textContent).toContain('## Test Custom Feature')
      expect(preElement?.textContent).toContain('A custom feature for end-to-end testing')
    })

    // Step 4: Clean up - delete the custom feature
    // The manager should already be open from the first click
    // Find delete button for our feature - should be the only one
    expect(screen.getAllByText('Test Custom Feature')).toHaveLength(2) // One in prompt builder, one in manager

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Find the delete button by finding all buttons with delete title and click the first one
    const deleteButtons = screen.getAllByTitle('Delete feature')
    expect(deleteButtons).toHaveLength(1)
    await user.click(deleteButtons[0])

    // Verify feature is gone from manager
    expect(screen.queryByText('Test Custom Feature')).not.toBeInTheDocument()

    // Verify feature is gone from prompt builder
    const resetButton = screen.getByText('🔄 Reset')
    await user.click(resetButton)

    // Re-select mode to clear any cached state
    await user.click(architectButton)

    // Feature should no longer appear
    expect(screen.queryByRole('checkbox', { name: /Test Custom Feature/ })).not.toBeInTheDocument()

    // Cleanup mocks
    confirmSpy.mockRestore()
  })
})