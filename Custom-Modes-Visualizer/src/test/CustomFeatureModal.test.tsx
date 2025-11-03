import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { CustomFeatureModal } from '../components/CustomFeatureModal'
import type { CustomFeature } from '../types'

// Mock featureCategories
vi.mock('../data/features', () => ({
  featureCategories: [
    { id: 'communication-style', name: 'Communication Style', description: 'Style category' },
    { id: 'process-planning', name: 'Process & Planning', description: 'Planning category' },
    { id: 'technical-expertise', name: 'Technical Expertise', description: 'Tech category' },
  ],
}))

describe('CustomFeatureModal', () => {
  let user: ReturnType<typeof userEvent.setup>

  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()
  const mockOnUpdate = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    onUpdate: mockOnUpdate,
    editingFeature: null,
  }

  const editingFeature: CustomFeature = {
    id: 'custom-1',
    name: 'Existing Feature',
    description: 'Existing description',
    category: 'communication-style',
  }

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Modal Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<CustomFeatureModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Create Custom Feature')).not.toBeInTheDocument()
    })

    it('should render create modal when isOpen is true and no editingFeature', () => {
      render(<CustomFeatureModal {...defaultProps} />)

      expect(screen.getByText('Create Custom Feature')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('should render edit modal when editingFeature is provided', () => {
      render(<CustomFeatureModal {...defaultProps} editingFeature={editingFeature} />)

      expect(screen.getByText('Edit Custom Feature')).toBeInTheDocument()
      expect(screen.getByText('Update')).toBeInTheDocument()
    })

    it('should render all required form fields', () => {
      render(<CustomFeatureModal {...defaultProps} />)

      expect(screen.getByLabelText('Feature Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Description *')).toBeInTheDocument()
      expect(screen.getByLabelText('Category *')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Form State Management', () => {
    it('should initialize form with empty values for create mode', () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const nameInput = screen.getByLabelText('Feature Name *') as HTMLInputElement
      const descriptionTextarea = screen.getByLabelText('Description *') as HTMLTextAreaElement
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement

      expect(nameInput.value).toBe('')
      expect(descriptionTextarea.value).toBe('')
      expect(categorySelect.value).toBe('')
    })

    it('should populate form with editing feature values', () => {
      render(<CustomFeatureModal {...defaultProps} editingFeature={editingFeature} />)

      const nameInput = screen.getByLabelText('Feature Name *') as HTMLInputElement
      const descriptionTextarea = screen.getByLabelText('Description *') as HTMLTextAreaElement
      const categorySelect = screen.getByLabelText('Category *') as HTMLSelectElement

      expect(nameInput.value).toBe('Existing Feature')
      expect(descriptionTextarea.value).toBe('Existing description')
      expect(categorySelect.value).toBe('communication-style')
    })

    it('should reset form when modal closes and reopens', async () => {
      render(<CustomFeatureModal {...defaultProps} editingFeature={editingFeature} />)

      // Verify initial values
      expect((screen.getByLabelText('Feature Name *') as HTMLInputElement).value).toBe('Existing Feature')

      // Close modal
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      expect(mockOnClose).toHaveBeenCalled()

      // Re-open in create mode
      render(<CustomFeatureModal {...defaultProps} />)

      // Should be empty now
      expect((screen.getByLabelText('Feature Name *') as HTMLInputElement).value).toBe('')
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      // Try to save with empty fields
      const saveButton = screen.getByText('Create')
      await user.click(saveButton)

      expect(screen.getByText('Feature name is required')).toBeInTheDocument()
      expect(screen.getByText('Feature description is required')).toBeInTheDocument()
      expect(screen.getByText('Please select a category')).toBeInTheDocument()
    })

    it('should show validation error for name too short', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const nameInput = screen.getByLabelText('Feature Name *')
      await user.type(nameInput, 'ab')

      const saveButton = screen.getByText('Create')
      await user.click(saveButton)

      expect(screen.getByText('Feature name must be at least 3 characters')).toBeInTheDocument()
    })

    it('should show validation error for description too short', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const descriptionTextarea = screen.getByLabelText('Description *')
      await user.type(descriptionTextarea, 'short')

      const saveButton = screen.getByText('Create')
      await user.click(saveButton)

      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument()
    })

    it('should not show validation errors for valid input', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const nameInput = screen.getByLabelText('Feature Name *')
      const descriptionTextarea = screen.getByLabelText('Description *')
      const categorySelect = screen.getByLabelText('Category *')

      await user.type(nameInput, 'Valid Feature Name')
      await user.type(descriptionTextarea, 'This is a valid description that meets the minimum length requirement')
      await user.selectOptions(categorySelect, 'communication-style')

      const saveButton = screen.getByText('Create')
      await user.click(saveButton)

      expect(screen.queryByText('Feature name is required')).not.toBeInTheDocument()
      expect(screen.queryByText('Feature description is required')).not.toBeInTheDocument()
      expect(screen.queryByText('Please select a category')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call onSave with correct data for create mode', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const nameInput = screen.getByLabelText('Feature Name *')
      const descriptionTextarea = screen.getByLabelText('Description *')
      const categorySelect = screen.getByLabelText('Category *')

      await user.type(nameInput, 'New Feature')
      await user.type(descriptionTextarea, 'This is a description for the new feature')
      await user.selectOptions(categorySelect, 'communication-style')

      const saveButton = screen.getByText('Create')
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'New Feature',
        description: 'This is a description for the new feature',
        category: 'communication-style',
      })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onUpdate with correct data for edit mode', async () => {
      render(<CustomFeatureModal {...defaultProps} editingFeature={editingFeature} />)

      const nameInput = screen.getByLabelText('Feature Name *')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Feature Name')

      const updateButton = screen.getByText('Update')
      await user.click(updateButton)

      expect(mockOnUpdate).toHaveBeenCalledWith('custom-1', {
        name: 'Updated Feature Name',
        description: 'Existing description',
        category: 'communication-style',
      })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should trim whitespace from inputs', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const nameInput = screen.getByLabelText('Feature Name *')
      const descriptionTextarea = screen.getByLabelText('Description *')

      await user.type(nameInput, '  Feature with spaces  ')
      await user.type(descriptionTextarea, '  Description with spaces  ')
      await user.selectOptions(screen.getByLabelText('Category *'), 'communication-style')

      const saveButton = screen.getByText('Create')
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Feature with spaces',
        description: 'Description with spaces',
        category: 'communication-style',
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should submit form on Enter key in name field', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const nameInput = screen.getByLabelText('Feature Name *')
      await user.type(nameInput, 'Test Feature{enter}')

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should submit form on Enter key in description field', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const descriptionTextarea = screen.getByLabelText('Description *')
      await user.type(descriptionTextarea, 'Test description{enter}')

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal on Escape key', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not submit on Enter+Shift in description', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const descriptionTextarea = screen.getByLabelText('Description *')
      await user.type(descriptionTextarea, 'Test{Shift>}{Enter}{/Shift}')

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Category Selection', () => {
    it('should display category description when category is selected', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const categorySelect = screen.getByLabelText('Category *')
      await user.selectOptions(categorySelect, 'communication-style')

      expect(screen.getByText('Style category')).toBeInTheDocument()
    })

    it('should not display description when no category selected', () => {
      render(<CustomFeatureModal {...defaultProps} />)

      expect(screen.queryByText('Style category')).not.toBeInTheDocument()
    })
  })

  describe('Modal Actions', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not submit invalid form', async () => {
      render(<CustomFeatureModal {...defaultProps} />)

      const saveButton = screen.getByText('Create')
      await user.click(saveButton)

      expect(mockOnSave).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})