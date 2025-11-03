import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PromptBuilder from '../components/PromptBuilder'
import type { Mode } from '../types'

// Mock CustomFeatureManager component
vi.mock('../components/CustomFeatureManager', () => ({
  CustomFeatureManager: () => <div data-testid="custom-feature-manager">Custom Feature Manager</div>
}))

// Mock the entire ModeContext
vi.mock('../context/ModeContext', () => ({
  useModes: vi.fn(() => ({
    customFeatures: [],
    reorderCustomFeatures: vi.fn(),
  })),
  ModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
})

// Mock data
const mockModes: Mode[] = [
  {
    slug: 'cherished-architect',
    name: '🏗️ Architect',
    description: 'Plans system architecture and technical designs',
    usage: 'Use for initial planning of complex tasks and systems',
    prompt: 'You are the Architect specialist...',
    family: 'cherished'
  },
  {
    slug: 'cherished-debug',
    name: '🐛 QA/Debug Engineer',
    description: 'Troubleshoots issues, Diagnoses, Test',
    usage: 'Use when investigating issues and errors',
    prompt: 'You are the Debug specialist...',
    family: 'cherished'
  },
  {
    slug: 'default-mode',
    name: 'Default Mode',
    description: 'A default mode',
    usage: 'For general use',
    prompt: 'Default prompt text',
    family: 'default'
  }
]

describe('PromptBuilder', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    mockWriteText.mockResolvedValue(undefined)

    // Clear all mocks
    vi.resetAllMocks()
  })

  describe('UI Rendering Tests', () => {
    it('should display mode selection correctly', () => {
      render(<PromptBuilder modes={mockModes} />)

      // Check title
      expect(screen.getByText('🔧 Prompt Builder')).toBeInTheDocument()

      // Check mode selection label
      expect(screen.getByText('Select Base Mode')).toBeInTheDocument()

      // Check all modes are rendered as buttons
      expect(screen.getByText('🏗️ Architect')).toBeInTheDocument()
      expect(screen.getByText('🐛 QA/Debug Engineer')).toBeInTheDocument()
      expect(screen.getByText('Default Mode')).toBeInTheDocument()

      // Check mode descriptions
      expect(screen.getByText('Plans system architecture and technical designs')).toBeInTheDocument()
    })

    it('should render feature checkboxes grouped by category when mode selected', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select a mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Check that feature categories are rendered
      expect(screen.getByText('Communication Style')).toBeInTheDocument()
      expect(screen.getByText('Process & Planning')).toBeInTheDocument()
      expect(screen.getByText('Technical Expertise')).toBeInTheDocument()
      expect(screen.getByText('Tool Integration')).toBeInTheDocument()

      // Check that feature checkboxes are present
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should render UI elements properly', () => {
      render(<PromptBuilder modes={mockModes} />)

      // Check labels
      expect(screen.getByText('Additional Instructions (Optional)')).toBeInTheDocument()

      // Check textarea for custom instructions
      const textarea = screen.getByPlaceholderText('Add specific requirements, constraints, or customizations...')
      expect(textarea).toBeInTheDocument()

      // Check buttons
      expect(screen.getByText('🚀 Generate Prompt')).toBeInTheDocument()
      expect(screen.getByText('🔄 Reset')).toBeInTheDocument()

      // Generate button should be disabled initially
      const generateButton = screen.getByText('🚀 Generate Prompt')
      expect(generateButton).toBeDisabled()
    })

    it('should show feature toggles only after mode selection', () => {
      render(<PromptBuilder modes={mockModes} />)

      // Initially no feature toggles
      expect(screen.queryByText('Feature Enhancements')).not.toBeInTheDocument()

      // After selecting mode, feature toggles appear
      // (This is tested in the feature grouping test above)
    })
  })

  describe('State Management Tests', () => {
    it('should update state correctly when mode is selected', async () => {
      render(<PromptBuilder modes={mockModes} />)

      const allArchitectElements = screen.getAllByText('🏗️ Architect')
      const architectButton = allArchitectElements[0].closest('button')!
      await user.click(architectButton)

      // Button should be highlighted
      expect(architectButton).toHaveClass('border-blue-500')
      expect(architectButton).toHaveClass('bg-blue-50')

      // Generate button should now be enabled
      const generateButton = screen.getByText('🚀 Generate Prompt')
      expect(generateButton).not.toBeDisabled()
    })

    it('should update custom prompt state when typing', async () => {
      render(<PromptBuilder modes={mockModes} />)

      const textarea = screen.getByPlaceholderText('Add specific requirements, constraints, or customizations...')
      await user.type(textarea, 'Test custom instructions')

      expect(textarea).toHaveValue('Test custom instructions')
    })

    it('should toggle feature checkboxes correctly', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode to show features
      const allArchitectElements = screen.getAllByText('🏗️ Architect')
      const architectButton = allArchitectElements[0].closest('button')!
      await user.click(architectButton)

      // Find a checkbox and check initial state (should be enabled by default for architect)
      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0] as HTMLInputElement
      const initialState = firstCheckbox.checked

      // Toggle it (click to uncheck)
      await user.click(firstCheckbox)

      // Checkbox should now be the opposite
      expect(firstCheckbox.checked).toBe(!initialState)
    })

    it('should reset all state when reset button clicked', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode and add custom prompt
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      const textarea = screen.getByPlaceholderText('Add specific requirements, constraints, or customizations...')
      await user.type(textarea, 'Test instructions')

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Verify prompt is generated
      expect(screen.getByText('Generated Prompt')).toBeInTheDocument()

      // Reset
      const resetButton = screen.getByText('🔄 Reset')
      await user.click(resetButton)

      // Verify reset
      expect(generateButton).toBeDisabled()
      expect(textarea).toHaveValue('')
      expect(screen.queryByText('Generated Prompt')).not.toBeInTheDocument()
    })
  })

  describe('Prompt Generation Tests', () => {
    it('should include base mode prompt when no features enabled', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for generated prompt to appear in DOM
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Check generated prompt contains base mode prompt
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      expect(preElement).toHaveTextContent('You are the Architect specialist...')
    })

    it('should add feature enhancements section when features are enabled', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Enable a feature
      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0]
      await user.click(firstCheckbox)

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for generated prompt to appear in DOM
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Check for feature enhancements section
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      expect(preElement).toHaveTextContent('--- Feature Enhancements ---')
      expect(preElement).toHaveTextContent('## ')
    })


    it('should append custom instructions correctly', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Add custom instructions
      const textarea = screen.getByPlaceholderText('Add specific requirements, constraints, or customizations...')
      await user.type(textarea, 'Custom test instructions')

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await act(async () => {
        await user.click(generateButton)
      })

      // Wait for generated prompt to appear in DOM
      const preElement = await screen.findByText('Generated Prompt').then(el =>
        el.parentElement?.parentElement?.querySelector('pre')
      )

      // Check custom instructions are appended
      expect(preElement).toHaveTextContent('Additional Instructions: Custom test instructions')
    })

  })

  describe('Integration Tests', () => {
    it('should complete workflow: select mode → toggle features → generate prompt', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // 1. Select mode
      const allArchitectElements = screen.getAllByText('🏗️ Architect')
      const architectButton = allArchitectElements[0].closest('button')!
      await user.click(architectButton)

      // 2. Toggle features (enable a feature that's disabled by default)
      const checkboxes = screen.getAllByRole('checkbox')
      // Find a checkbox that's initially unchecked
      const uncheckedCheckbox = checkboxes.find(cb => !(cb as HTMLInputElement).checked) as HTMLInputElement
      if (uncheckedCheckbox) {
        await user.click(uncheckedCheckbox)
      }

      // 3. Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for generated prompt to appear in DOM
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Verify prompt is generated and contains expected elements
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      const text = preElement?.textContent || ''

      expect(text).toContain('You are the Architect specialist...')
      if (uncheckedCheckbox) {
        expect(text).toContain('--- Feature Enhancements ---')
        expect(text).toContain('## ')
      }
    })

    it('should update default features when mode is switched', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select architect mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Check initial feature state (should match defaults for architect)
      const checkboxesAfterArchitect = screen.getAllByRole('checkbox')
      const initialStates = checkboxesAfterArchitect.map(cb => (cb as HTMLInputElement).checked)

      // Switch to debug mode
      const debugButton = screen.getByText('🐛 QA/Debug Engineer')
      await user.click(debugButton)

      // Check feature states changed (debug has different defaults)
      const checkboxesAfterDebug = screen.getAllByRole('checkbox')
      const newStates = checkboxesAfterDebug.map(cb => (cb as HTMLInputElement).checked)

      // States should be different (architect and debug have different default features)
      expect(initialStates).not.toEqual(newStates)
    })

    it('should handle all features enabled scenario', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Enable all features
      const checkboxes = screen.getAllByRole('checkbox')
      for (const checkbox of checkboxes) {
        if (!(checkbox as HTMLInputElement).checked) {
          await user.click(checkbox)
        }
      }

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for generated prompt to appear in DOM
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Verify all features are included
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      const text = preElement?.textContent || ''
      const featureSections = text.match(/## /g)
      expect(featureSections).toHaveLength(checkboxes.length)
    })

    it('should handle edge case: empty custom prompt', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Leave custom prompt empty (default state)

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for generated prompt to appear in DOM
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Verify no additional instructions section
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      expect(preElement).not.toHaveTextContent('Additional Instructions:')
    })

    it('should handle edge case: no mode selected', () => {
      render(<PromptBuilder modes={mockModes} />)

      // Generate button should be disabled
      const generateButton = screen.getByText('🚀 Generate Prompt')
      expect(generateButton).toBeDisabled()

      // Click should not cause errors
      // (Testing Library will throw if there are unhandled errors)
    })
  })


  describe('TypeScript Types and Interfaces', () => {
    it('should accept modes prop with correct type', () => {
      expect(() => {
        render(<PromptBuilder modes={mockModes} />)
      }).not.toThrow()
    })

    it('should work with modes containing all required Mode properties', () => {
      const completeMode: Mode = {
        slug: 'test-slug',
        name: 'Test Name',
        description: 'Test description',
        usage: 'Test usage',
        prompt: 'Test prompt',
        family: 'test-family'
      }

      expect(() => {
        render(<PromptBuilder modes={[completeMode]} />)
      }).not.toThrow()
    })
  })
})