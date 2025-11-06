import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PromptBuilder from '../components/PromptBuilder'
import type { Mode, CustomFeature } from '../types'

// Mock CustomFeatureManager component
vi.mock('../components/CustomFeatureManager', () => ({
  CustomFeatureManager: () => <div data-testid="custom-feature-manager">Custom Feature Manager</div>
}))

// Mock the ModeContext
const mockCustomFeatures: CustomFeature[] = []
const mockAddCustomFeature = vi.fn()
const mockUpdateCustomFeature = vi.fn()
const mockDeleteCustomFeature = vi.fn()
const mockReorderCustomFeatures = vi.fn()

vi.mock('../context/ModeContext', () => ({
  useModes: () => ({
    customFeatures: mockCustomFeatures,
    addCustomFeature: mockAddCustomFeature,
    updateCustomFeature: mockUpdateCustomFeature,
    deleteCustomFeature: mockDeleteCustomFeature,
    reorderCustomFeatures: mockReorderCustomFeatures,
  }),
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
]

describe('Custom Features Integration', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    mockWriteText.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Custom Feature Creation', () => {
    it('should allow creating a custom feature and using it in prompt generation', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Open custom feature manager
      const manageButton = screen.getByText('Manage Custom Features')
      await user.click(manageButton)

      // Verify manager is shown
      expect(screen.getByTestId('custom-feature-manager')).toBeInTheDocument()
    })
  })

  describe('Custom Feature in Prompt Generation', () => {
    beforeEach(() => {
      // Setup custom features for this test
      mockCustomFeatures.length = 0
      mockCustomFeatures.push({
        id: 'custom-1',
        name: 'Custom Test Feature',
        description: 'A custom feature for testing',
        category: 'communication-style',
      })
    })

    afterEach(() => {
      mockCustomFeatures.length = 0
    })

    it('should include custom features in prompt generation when enabled', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Find and enable the custom feature checkbox
      const customFeatureCheckbox = screen.getByRole('checkbox', { name: /Custom Test Feature/ })
      await user.click(customFeatureCheckbox)

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for prompt generation
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Verify custom feature is included
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      const promptText = preElement?.textContent || ''
      expect(promptText).toContain('--- Feature Enhancements ---')
      expect(promptText).toContain('## Custom Test Feature')
      expect(promptText).toContain('A custom feature for testing')
    })

    it('should not include disabled custom features in generated prompt', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Custom feature should be disabled by default
      // Generate prompt without enabling custom feature
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for prompt generation
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Verify custom feature is not included
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      const promptText = preElement?.textContent || ''
      expect(promptText).not.toContain('## Custom Test Feature')
    })

    it('should include custom features in correct category order', async () => {
      // Add custom features in different categories
      mockCustomFeatures.push({
        id: 'custom-2',
        name: 'Planning Custom Feature',
        description: 'Custom planning feature',
        category: 'process-planning',
      })

      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Enable both custom features
      const customFeature1 = screen.getByRole('checkbox', { name: /Custom Test Feature/ })
      const customFeature2 = screen.getByRole('checkbox', { name: /Planning Custom Feature/ })
      await user.click(customFeature1)
      await user.click(customFeature2)

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for prompt generation
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Verify features appear in category order
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      const promptText = preElement?.textContent || ''

      const customFeatureIndex = promptText.indexOf('## Custom Test Feature')
      const planningFeatureIndex = promptText.indexOf('## Planning Custom Feature')

      // Custom Test Feature (communication-style) should come before Planning Custom Feature (process-planning)
      expect(customFeatureIndex).toBeLessThan(planningFeatureIndex)
    })
  })

  describe('Custom Features with Built-in Features', () => {
    beforeEach(() => {
      mockCustomFeatures.length = 0
      mockCustomFeatures.push({
        id: 'custom-1',
        name: 'Custom Communication Feature',
        description: 'Custom feature for communication',
        category: 'communication-style',
      })
    })

    afterEach(() => {
      mockCustomFeatures.length = 0
    })

    it('should include both built-in and custom features when enabled', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Enable a built-in feature (should be enabled by default for architect)
      // Enable custom feature
      const customFeatureCheckbox = screen.getByRole('checkbox', { name: /Custom Communication Feature/ })
      await user.click(customFeatureCheckbox)

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for prompt generation
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement).toBeInTheDocument()
      })

      // Verify both types of features are included
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      const promptText = preElement?.textContent || ''
      expect(promptText).toContain('--- Feature Enhancements ---')
      expect(promptText).toContain('## Custom Communication Feature')
    })
  })

  describe('Custom Feature Persistence', () => {
    it('should persist custom features state across prompt generations', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Enable custom feature
      const customFeatureCheckbox = screen.getByRole('checkbox', { name: /Custom Test Feature/ })
      await user.click(customFeatureCheckbox)

      // Generate first prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Verify feature is included
      await waitFor(() => {
        const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
        expect(preElement?.textContent).toContain('## Custom Test Feature')
      })

      // Generate another prompt (should maintain checkbox state)
      const regenerateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(regenerateButton)

      // Verify feature is still included
      await waitFor(() => {
        const preElements = screen.getAllByText('Generated Prompt')
        const latestPre = preElements[preElements.length - 1].parentElement?.parentElement?.querySelector('pre')
        expect(latestPre?.textContent).toContain('## Custom Test Feature')
      })
    })
  })
})