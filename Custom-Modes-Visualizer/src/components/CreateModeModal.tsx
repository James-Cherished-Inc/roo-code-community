import React, { useState, useEffect } from 'react';
import { useModes } from '../context/ModeContext';
import type { Mode } from '../types';

/**
 * Props for the CreateModeModal component
 */
interface CreateModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for creating new modes
 */
const CreateModeModal: React.FC<CreateModeModalProps> = ({ isOpen, onClose }) => {
  const { modes, addMode } = useModes();
  const [formData, setFormData] = useState<Partial<Mode>>({
    slug: '',
    name: '',
    description: '',
    usage: '',
    prompt: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Mode, string>>>({});

  /**
   * Reset form when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      setFormData({
        slug: '',
        name: '',
        description: '',
        usage: '',
        prompt: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof Mode, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };


  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Mode, string>> = {};

    // Required field validation
    if (!formData.slug?.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.usage?.trim()) {
      newErrors.usage = 'Usage instructions are required';
    }
    if (!formData.prompt?.trim()) {
      newErrors.prompt = 'Prompt is required';
    }

    // Slug uniqueness validation
    if (formData.slug?.trim() && modes.some(mode => mode.slug === formData.slug?.trim())) {
      newErrors.slug = 'This slug is already in use. Please choose a different one.';
    }

    // Slug format validation (alphanumeric and hyphens only)
    if (formData.slug?.trim() && !/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form save
   */
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Create new mode with all required fields
    const newMode: Mode = {
      slug: formData.slug!.trim(),
      name: formData.name!.trim(),
      description: formData.description!.trim(),
      usage: formData.usage!.trim(),
      prompt: formData.prompt!.trim(),
      family: 'standalone' // Assign new modes to standalone family by default
    };

    addMode(newMode);
    onClose();
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create New Mode
          </h3>

          <div className="space-y-4">
            {/* Slug Field */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., my-custom-mode"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lowercase letters, numbers, and hyphens only (e.g., my-custom-mode)
              </p>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 🚀 Custom Mode"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of the mode's purpose"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Usage Field */}
            <div>
              <label htmlFor="usage" className="block text-sm font-medium text-gray-700 mb-1">
                Usage Instructions *
              </label>
              <input
                type="text"
                id="usage"
                value={formData.usage || ''}
                onChange={(e) => handleInputChange('usage', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.usage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="When and how to use this mode"
              />
              {errors.usage && (
                <p className="mt-1 text-sm text-red-600">{errors.usage}</p>
              )}
            </div>

            {/* Prompt Field */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt *
              </label>
              <textarea
                id="prompt"
                rows={6}
                value={formData.prompt || ''}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.prompt ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="The prompt text that defines this mode's behavior"
              />
              {errors.prompt && (
                <p className="mt-1 text-sm text-red-600">{errors.prompt}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={Object.keys(errors).length > 0 || !formData.slug?.trim() || !formData.name?.trim() || !formData.description?.trim() || !formData.usage?.trim() || !formData.prompt?.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModeModal;