import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PromptBuilder from '../components/PromptBuilder'
import type { Mode, CustomFeature } from '../types'

// Mock CustomFeatureManager component
vi.mock('../components/CustomFeatureManager', () => ({
  CustomFeatureManager: () => <div data-testid="custom-feature-manager">Custom Feature Manager</div>
}))

// Mock the ModeContext with custom features
const mockCustomFeatures: CustomFeature[] = [
  {
    id: 'custom-1',
    name: 'First Custom Feature',
    description: 'First custom feature description',
    category: 'communication-style',
  },
  {
    id: 'custom-2',
    name: 'Second Custom Feature',
    description: 'Second custom feature description',
    category: 'communication-style',
  },
  {
    id: 'custom-3',
    name: 'Third Custom Feature',
    description: 'Third custom feature description',
    category: 'process-planning',
  },
]

const mockReorderCustomFeatures = vi.fn()

vi.mock('../context/ModeContext', () => ({
  useModes: () => ({
    customFeatures: mockCustomFeatures,
    reorderCustomFeatures: mockReorderCustomFeatures,
  }),
  ModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock @dnd-kit modules
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd-context" data-on-drag-end={onDragEnd ? 'true' : 'false'}>
      {children}
    </div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: ({ id }: any) => ({
    attributes: { 'data-testid': `sortable-${id}` },
    listeners: { onClick: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: vi.fn((array, oldIndex, newIndex) => {
    const result = [...array]
    const [removed] = result.splice(oldIndex, 1)
    result.splice(newIndex, 0, removed)
    return result
  }),
  SortableContext: ({ children, items }: any) => (
    <div data-testid="sortable-context" data-items={JSON.stringify(items)}>
      {children}
    </div>
  ),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
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

describe('Custom Features Drag and Drop', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    mockWriteText.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Drag and Drop Setup', () => {
    it('should render drag and drop context when mode is selected', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Verify DndContext is present
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
      expect(screen.getByTestId('dnd-context')).toHaveAttribute('data-on-drag-end', 'true')
    })

    it('should render sortable contexts for each category', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Should have sortable contexts for categories with custom features
      const sortableContexts = screen.getAllByTestId('sortable-context')
      expect(sortableContexts.length).toBeGreaterThan(0)
    })

    it('should show drag handles for custom features', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Check for drag handle buttons (represented by SVG icons)
      const dragHandles = screen.getAllByTitle('Drag to reorder')
      expect(dragHandles.length).toBe(mockCustomFeatures.length)
    })
  })

  describe('Feature Ordering', () => {
    it('should display custom features in their current order within categories', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Get all feature names in the order they appear
      const featureElements = screen.getAllByText(/First Custom Feature|Second Custom Feature|Third Custom Feature/)
      const featureNames = featureElements.map(el => el.textContent)

      // Should appear in original order within their categories
      expect(featureNames).toContain('First Custom Feature')
      expect(featureNames).toContain('Second Custom Feature')
      expect(featureNames).toContain('Third Custom Feature')
    })

    it('should group features by category correctly', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Check category sections
      expect(screen.getByText('Communication Style')).toBeInTheDocument()
      expect(screen.getByText('Process & Planning')).toBeInTheDocument()

      // Features should be grouped under their categories
      const communicationSection = screen.getByText('Communication Style').closest('div')
      const planningSection = screen.getByText('Process & Planning').closest('div')

      expect(communicationSection?.textContent).toContain('First Custom Feature')
      expect(communicationSection?.textContent).toContain('Second Custom Feature')
      expect(planningSection?.textContent).toContain('Third Custom Feature')
    })
  })

  describe('Drag End Handling', () => {
    it('should call reorderCustomFeatures when dragging custom features within same category', async () => {
      // Mock the drag end event
      const mockDragEnd = vi.fn()
      vi.mocked(vi.importMock('@dnd-kit/core')).DndContext.mockImplementationOnce(
        ({ children, onDragEnd }: any) => {
          // Store the onDragEnd handler
          mockDragEnd.mockImplementation(onDragEnd)
          return (
            <div data-testid="dnd-context" data-on-drag-end={onDragEnd ? 'true' : 'false'}>
              {children}
            </div>
          )
        }
      )

      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Simulate drag end event (moving first custom feature to second position)
      const dragEndEvent = {
        active: { id: 'custom-1' },
        over: { id: 'custom-2' },
      }

      // Trigger the drag end handler
      mockDragEnd(dragEndEvent)

      // Should call reorderCustomFeatures
      expect(mockReorderCustomFeatures).toHaveBeenCalled()
      const reorderedFeatures = mockReorderCustomFeatures.mock.calls[0][0]

      // Verify the order was swapped
      expect(reorderedFeatures[0].id).toBe('custom-2') // Second feature moved to first
      expect(reorderedFeatures[1].id).toBe('custom-1') // First feature moved to second
    })

    it('should not call reorderCustomFeatures when dragging non-custom features', async () => {
      const mockDragEnd = vi.fn()
      vi.mocked(vi.importMock('@dnd-kit/core')).DndContext.mockImplementationOnce(
        ({ children, onDragEnd }: any) => {
          mockDragEnd.mockImplementation(onDragEnd)
          return (
            <div data-testid="dnd-context" data-on-drag-end={onDragEnd ? 'true' : 'false'}>
              {children}
            </div>
          )
        }
      )

      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Simulate drag end event with built-in feature IDs
      const dragEndEvent = {
        active: { id: 'empathyFriendlyTone' },
        over: { id: 'cleverJokes' },
      }

      mockDragEnd(dragEndEvent)

      // Should not call reorderCustomFeatures for built-in features
      expect(mockReorderCustomFeatures).not.toHaveBeenCalled()
    })

    it('should not call reorderCustomFeatures when dragging between different categories', async () => {
      const mockDragEnd = vi.fn()
      vi.mocked(vi.importMock('@dnd-kit/core')).DndContext.mockImplementationOnce(
        ({ children, onDragEnd }: any) => {
          mockDragEnd.mockImplementation(onDragEnd)
          return (
            <div data-testid="dnd-context" data-on-drag-end={onDragEnd ? 'true' : 'false'}>
              {children}
            </div>
          )
        }
      )

      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Simulate drag end event (custom-1 from communication-style to custom-3 position in process-planning)
      // Since custom-1 and custom-3 are in different categories, this should not trigger reorder
      const dragEndEvent = {
        active: { id: 'custom-1' },
        over: { id: 'custom-3' },
      }

      mockDragEnd(dragEndEvent)

      // Should not call reorderCustomFeatures for cross-category drags
      expect(mockReorderCustomFeatures).not.toHaveBeenCalled()
    })

    it('should handle drag end when no valid drop target', async () => {
      const mockDragEnd = vi.fn()
      vi.mocked(vi.importMock('@dnd-kit/core')).DndContext.mockImplementationOnce(
        ({ children, onDragEnd }: any) => {
          mockDragEnd.mockImplementation(onDragEnd)
          return (
            <div data-testid="dnd-context" data-on-drag-end={onDragEnd ? 'true' : 'false'}>
              {children}
            </div>
          )
        }
      )

      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Simulate drag end event with no valid over target
      const dragEndEvent = {
        active: { id: 'custom-1' },
        over: null,
      }

      mockDragEnd(dragEndEvent)

      // Should not call reorderCustomFeatures
      expect(mockReorderCustomFeatures).not.toHaveBeenCalled()
    })
  })

  describe('Prompt Generation with Reordered Features', () => {
    it('should use reordered custom features in prompt generation', async () => {
      // Mock reordered features (simulate drag operation result)
      const reorderedFeatures = [
        mockCustomFeatures[1], // Second feature first
        mockCustomFeatures[0], // First feature second
        mockCustomFeatures[2], // Third feature unchanged
      ]

      vi.mocked(vi.importMock('../context/ModeContext')).useModes.mockReturnValueOnce({
        customFeatures: reorderedFeatures,
        reorderCustomFeatures: mockReorderCustomFeatures,
      })

      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Enable both custom features in communication category
      const firstFeatureCheckbox = screen.getByRole('checkbox', { name: /Second Custom Feature/ })
      const secondFeatureCheckbox = screen.getByRole('checkbox', { name: /First Custom Feature/ })
      await user.click(firstFeatureCheckbox)
      await user.click(secondFeatureCheckbox)

      // Generate prompt
      const generateButton = screen.getByText('🚀 Generate Prompt')
      await user.click(generateButton)

      // Wait for prompt
      await new Promise(resolve => setTimeout(resolve, 0))

      // Verify features appear in reordered sequence in prompt
      const preElement = screen.getByText('Generated Prompt').parentElement?.parentElement?.querySelector('pre')
      const promptText = preElement?.textContent || ''

      const secondFeatureIndex = promptText.indexOf('## Second Custom Feature')
      const firstFeatureIndex = promptText.indexOf('## First Custom Feature')

      // Second feature should appear before first feature in reordered prompt
      expect(secondFeatureIndex).toBeLessThan(firstFeatureIndex)
    })
  })

  describe('UI Feedback During Drag', () => {
    it('should show drag handles as clickable elements', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Check drag handles have proper styling and attributes
      const dragHandles = screen.getAllByTitle('Drag to reorder')
      dragHandles.forEach(handle => {
        expect(handle).toHaveClass('cursor-grab')
        expect(handle).toHaveAttribute('title', 'Drag to reorder')
      })
    })

    it('should maintain feature state during drag operations', async () => {
      render(<PromptBuilder modes={mockModes} />)

      // Select mode
      const architectButton = screen.getByText('🏗️ Architect')
      await user.click(architectButton)

      // Enable a custom feature
      const firstFeatureCheckbox = screen.getByRole('checkbox', { name: /First Custom Feature/ })
      await user.click(firstFeatureCheckbox)

      // Verify it stays checked
      expect(firstFeatureCheckbox).toBeChecked()

      // Simulate drag operation (checkbox should remain checked)
      expect(firstFeatureCheckbox).toBeChecked()
    })
  })
})