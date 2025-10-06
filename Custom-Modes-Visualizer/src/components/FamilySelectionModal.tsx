import React, { useState, useEffect } from 'react';
import { useModes } from '../context/ModeContext';
import type { ModeFamily } from '../types';

/**
 * Props for the FamilySelectionModal component
 */
interface FamilySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFamilySelect: (family: ModeFamily | null) => void;
  excludeFamilies?: string[]; // Families to exclude from selection (e.g., 'default' if not wanted)
}

/**
 * Modal component for selecting or creating a family for a new mode
 */
const FamilySelectionModal: React.FC<FamilySelectionModalProps> = ({
  isOpen,
  onClose,
  onFamilySelect,
  excludeFamilies = []
}) => {
  const { families, addFamily } = useModes();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDescription, setNewFamilyDescription] = useState('');
  const [newFamilyColor, setNewFamilyColor] = useState('#3B82F6');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Filter out excluded families
  const availableFamilies = families.filter(family => !excludeFamilies.includes(family.id));

  /**
   * Reset modal state when opened
   */
  useEffect(() => {
    if (isOpen) {
      setSelectedFamilyId('');
      setShowCreateForm(false);
      setNewFamilyName('');
      setNewFamilyDescription('');
      setNewFamilyColor('#3B82F6');
      setErrors({});
    }
  }, [isOpen]);

  /**
   * Validate new family form
   */
  const validateNewFamilyForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (!newFamilyName.trim()) {
      newErrors.name = 'Family name is required';
    }
    if (!newFamilyDescription.trim()) {
      newErrors.description = 'Family description is required';
    }

    // Check for duplicate family names
    if (newFamilyName.trim() && families.some(family => family.name.toLowerCase() === newFamilyName.trim().toLowerCase())) {
      newErrors.name = 'A family with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle family selection
   */
  const handleFamilySelect = (family: ModeFamily | null) => {
    onFamilySelect(family);
    onClose();
  };

  /**
   * Handle creating a new family
   */
  const handleCreateFamily = () => {
    if (!validateNewFamilyForm()) {
      return;
    }

    // Generate family ID from name
    const familyId = newFamilyName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Create new family
    const newFamily: ModeFamily = {
      id: familyId,
      name: newFamilyName.trim(),
      description: newFamilyDescription.trim(),
      color: newFamilyColor
    };

    addFamily(newFamily);
    onFamilySelect(newFamily);
    onClose();
  };

  /**
   * Toggle create form visibility
   */
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    if (!showCreateForm) {
      // Reset form when showing create form
      setNewFamilyName('');
      setNewFamilyDescription('');
      setNewFamilyColor('#3B82F6');
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Choose Family
          </h3>

          <div className="space-y-4">
            {/* Existing Families */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing Family
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableFamilies.map((family) => (
                  <label key={family.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded">
                    <input
                      type="radio"
                      name="family"
                      value={family.id}
                      checked={selectedFamilyId === family.id}
                      onChange={(e) => setSelectedFamilyId(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      {family.color && (
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: family.color }}
                        />
                      )}
                      <span className="text-sm text-gray-700">{family.name}</span>
                      {family.isDefault && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">Default</span>
                      )}
                      {family.id === 'standalone' && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">Auto</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Create New Family Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={toggleCreateForm}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <svg className={`w-4 h-4 transition-transform ${showCreateForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{showCreateForm ? 'Cancel Create Family' : 'Create New Family'}</span>
              </button>
            </div>

            {/* Create Family Form */}
            {showCreateForm && (
              <div className="space-y-4 border border-gray-200 rounded-md p-4 bg-gray-50">
                <div>
                  <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Family Name *
                  </label>
                  <input
                    type="text"
                    id="familyName"
                    value={newFamilyName}
                    onChange={(e) => {
                      setNewFamilyName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., My Custom Family"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="familyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    id="familyDescription"
                    value={newFamilyDescription}
                    onChange={(e) => {
                      setNewFamilyDescription(e.target.value);
                      if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of the family"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="familyColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Color Theme
                  </label>
                  <input
                    type="color"
                    id="familyColor"
                    value={newFamilyColor}
                    onChange={(e) => setNewFamilyColor(e.target.value)}
                    className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600">{newFamilyColor}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            {selectedFamilyId ? (
              <button
                onClick={() => {
                  const selectedFamily = availableFamilies.find(f => f.id === selectedFamilyId);
                  handleFamilySelect(selectedFamily || null);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Select Family
              </button>
            ) : showCreateForm ? (
              <button
                onClick={handleCreateFamily}
                disabled={!newFamilyName.trim() || !newFamilyDescription.trim() || Object.keys(errors).length > 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create & Select Family
              </button>
            ) : (
              <button
                onClick={() => handleFamilySelect(null)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                No Family
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilySelectionModal;