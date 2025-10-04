import React, { useState } from 'react';
import type { Mode } from '../types';
import { useModes } from '../context/ModeContext';

/**
 * Props for the ModeDetail component
 */
interface ModeDetailProps {
  /** The mode to display and edit */
  mode: Mode;
  /** Callback when mode is updated */
  onUpdate?: (updatedMode: Mode) => void;
}

/**
 * Component for displaying and editing a single mode in detail
 */
const ModeDetail: React.FC<ModeDetailProps> = ({ mode, onUpdate }) => {
  const { updateMode } = useModes();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMode, setEditedMode] = useState<Mode>(mode);

  /**
   * Handle starting edit mode
   */
  const startEdit = () => {
    setEditedMode(mode);
    setIsEditing(true);
  };

  /**
   * Handle saving changes
   */
  const saveEdit = () => {
    updateMode(mode.slug, editedMode);
    setIsEditing(false);
    onUpdate?.(editedMode);
  };

  /**
   * Handle canceling edit
   */
  const cancelEdit = () => {
    setEditedMode(mode);
    setIsEditing(false);
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof Mode, value: string) => {
    setEditedMode(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{mode.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Slug: {mode.slug}</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={startEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ✏️ Edit
            </button>
          ) : (
            <>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                💾 Save
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedMode.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-lg text-gray-900">{mode.name}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editedMode.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-700">{mode.description}</p>
          )}
        </div>

        {/* Usage Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usage Guidelines
          </label>
          {isEditing ? (
            <textarea
              value={editedMode.usage}
              onChange={(e) => handleInputChange('usage', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-700">{mode.usage}</p>
          )}
        </div>

        {/* Prompt Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          {isEditing ? (
            <textarea
              value={editedMode.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {mode.prompt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeDetail;