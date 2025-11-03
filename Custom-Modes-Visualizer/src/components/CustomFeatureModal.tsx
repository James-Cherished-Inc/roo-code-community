import React, { useState, useEffect } from 'react';
import type { CustomFeature } from '../types';
import { featureCategories } from '../data/features';

interface CustomFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feature: Omit<CustomFeature, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<CustomFeature>) => void;
  editingFeature?: CustomFeature | null;
}

export const CustomFeatureModal: React.FC<CustomFeatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingFeature,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingFeature) {
      setName(editingFeature.name);
      setDescription(editingFeature.description);
      setCategory(editingFeature.category);
    } else {
      setName('');
      setDescription('');
      setCategory('');
    }
    setErrors({});
  }, [editingFeature, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Feature name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Feature name must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Feature description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const featureData = {
      name: name.trim(),
      description: description.trim(),
      category,
    };

    if (editingFeature && onUpdate) {
      onUpdate(editingFeature.id, featureData);
    } else {
      onSave(featureData);
    }

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">
          {editingFeature ? 'Edit Custom Feature' : 'Create Custom Feature'}
        </h2>

        <div className="space-y-4">
          {/* Name field */}
          <div>
            <label htmlFor="feature-name" className="block text-sm font-medium text-gray-700 mb-1">
              Feature Name *
            </label>
            <input
              id="feature-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter feature name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description field */}
          <div>
            <label htmlFor="feature-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="feature-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe what this feature does"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category field */}
          <div>
            <label htmlFor="feature-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="feature-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {featureCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
            {category && (
              <p className="text-gray-600 text-sm mt-1">
                {featureCategories.find(cat => cat.id === category)?.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {editingFeature ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};