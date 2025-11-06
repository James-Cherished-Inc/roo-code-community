import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ModeProvider } from '../context/ModeContext'
import { CustomFeatureManager } from '../components/CustomFeatureManager'
import type { CustomFeature } from '../types'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock the CustomFeatureModal component
vi.mock('../components/CustomFeatureModal', () => ({
  CustomFeatureModal: ({ isOpen, onClose, onSave, onUpdate, editingFeature }: any) => (
    <div data-testid="custom-feature-modal">
      {isOpen && (
        <div>
          <button onClick={onClose} data-testid="modal-close">Close</button>
          {editingFeature ? (
            <button onClick={() => onUpdate(editingFeature.id, { name: 'Updated Name' })} data-testid="modal-update">
              Update
            </button>
          ) : (
            <button onClick={() => onSave({
              name: 'New Feature',
              description: 'New description',
              category: 'communication-style'
            })} data-testid="modal-save">
              Save
            </button>
          )}
        </div>
      )}
    </div>
  ),
}))

// Mock featureCategories
vi.mock('../data/features', () => ({
  featureCategories: [
    { id: 'communication-style', name: 'Communication Style', description: 'Test category' },
    { id: 'process-planning', name: 'Process & Planning', description: 'Another category' },
  ],
}))

describe('Custom Features LocalStorage', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    // Reset localStorage mocks
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockLocalStorage.clear.mockClear()
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Loading from localStorage', () => {
    it('should load custom features from localStorage on mount', () => {
      const mockStoredFeatures: CustomFeature[] = [
        {
          id: 'stored-1',
          name: 'Stored Feature 1',
          description: 'A stored feature',
          category: 'communication-style',
        },
        {
          id: 'stored-2',
          name: 'Stored Feature 2',
          description: 'Another stored feature',
          category: 'process-planning',
        },
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'roo-modes-visualizer-custom-features') {
          return JSON.stringify({
            features: mockStoredFeatures,
            lastModified: new Date().toISOString(),
          })
        }
        return null
      })

      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      expect(screen.getByText('Stored Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Stored Feature 2')).toBeInTheDocument()
    })

    it('should handle missing localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      expect(screen.getByText('No custom features')).toBeInTheDocument()
    })

    it('should handle malformed localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'roo-modes-visualizer-custom-features') {
          return 'invalid json'
        }
        return null
      })

      // Mock console.error to avoid test output pollution
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      expect(screen.getByText('No custom features')).toBeInTheDocument()
      expect(consoleError).toHaveBeenCalledWith('Failed to load data from localStorage:', expect.any(SyntaxError))

      consoleError.mockRestore()
    })
  })

  describe('Saving to localStorage', () => {
    it('should save custom features to localStorage when features are added', async () => {
      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      // Open modal and create feature
      const addButton = screen.getByText('Add Feature')
      await user.click(addButton)

      const saveButton = screen.getByTestId('modal-save')
      await user.click(saveButton)

      // Verify localStorage was called
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'roo-modes-visualizer-custom-features',
          expect.stringContaining('"features":[{"name":"New Feature"')
        )
      })
    })

    it('should save custom features to localStorage when features are updated', async () => {
      // Setup initial features
      const initialFeatures: CustomFeature[] = [
        {
          id: 'test-1',
          name: 'Test Feature',
          description: 'Test description',
          category: 'communication-style',
        },
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'roo-modes-visualizer-custom-features') {
          return JSON.stringify({
            features: initialFeatures,
            lastModified: new Date().toISOString(),
          })
        }
        return null
      })

      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      // Edit feature
      const editButtons = screen.getAllByTitle('Edit feature')
      await user.click(editButtons[0])

      const updateButton = screen.getByTestId('modal-update')
      await user.click(updateButton)

      // Verify localStorage was called with updated data
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'roo-modes-visualizer-custom-features',
          expect.stringContaining('"name":"Updated Name"')
        )
      })
    })

    it('should save custom features to localStorage when features are deleted', async () => {
      // Setup initial features
      const initialFeatures: CustomFeature[] = [
        {
          id: 'test-1',
          name: 'Test Feature',
          description: 'Test description',
          category: 'communication-style',
        },
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'roo-modes-visualizer-custom-features') {
          return JSON.stringify({
            features: initialFeatures,
            lastModified: new Date().toISOString(),
          })
        }
        return null
      })

      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      // Delete feature
      const deleteButtons = screen.getAllByTitle('Delete feature')
      await user.click(deleteButtons[0])

      // Verify localStorage was called with empty features
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'roo-modes-visualizer-custom-features',
          expect.stringContaining('"features":[]')
        )
      })
    })

    it('should include lastModified timestamp when saving', async () => {
      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      // Create a feature
      const addButton = screen.getByText('Add Feature')
      await user.click(addButton)

      const saveButton = screen.getByTestId('modal-save')
      await user.click(saveButton)

      // Verify timestamp is included
      await waitFor(() => {
        const lastCall = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1]
        const savedData = JSON.parse(lastCall[1])
        expect(savedData).toHaveProperty('lastModified')
        expect(new Date(savedData.lastModified)).toBeInstanceOf(Date)
      })
    })

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      // Try to create a feature
      const addButton = screen.getByText('Add Feature')
      await user.click(addButton)

      const saveButton = screen.getByTestId('modal-save')
      await user.click(saveButton)

      // Verify error was logged
      expect(consoleError).toHaveBeenCalledWith('Failed to save data to localStorage:', expect.any(Error))

      consoleError.mockRestore()
    })
  })

  describe('Auto-save behavior', () => {
    it('should auto-save when custom features change', async () => {
      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      // Initially should save empty state
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled()
      })

      const initialCallCount = mockLocalStorage.setItem.mock.calls.length

      // Create a feature
      const addButton = screen.getByText('Add Feature')
      await user.click(addButton)

      const saveButton = screen.getByTestId('modal-save')
      await user.click(saveButton)

      // Should have saved again
      await waitFor(() => {
        expect(mockLocalStorage.setItem.mock.calls.length).toBeGreaterThan(initialCallCount)
      })
    })
  })

  describe('Reset functionality', () => {
    it('should clear custom features from localStorage on reset', () => {
      // Setup initial features
      const initialFeatures: CustomFeature[] = [
        {
          id: 'test-1',
          name: 'Test Feature',
          description: 'Test description',
          category: 'communication-style',
        },
      ]

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'roo-modes-visualizer-custom-features') {
          return JSON.stringify({
            features: initialFeatures,
            lastModified: new Date().toISOString(),
          })
        }
        return null
      })

      // Render and trigger reset through context
      render(
        <ModeProvider>
          <CustomFeatureManager />
        </ModeProvider>
      )

      // Reset would happen through the context's resetModes function
      // which clears the custom features localStorage key
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('roo-modes-visualizer-custom-features')
    })
  })
})