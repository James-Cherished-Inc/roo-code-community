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
  const [editingField, setEditingField] = useState<keyof Mode | null>(null);

  // Defensive check for undefined mode
  if (!mode) {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading mode...</div>
      </div>
    );
  }

  /**
   * Handle starting edit mode for a field
   */
  const startEdit = (field: keyof Mode) => {
    setEditingField(field);
  };

  /**
   * Handle saving changes to a field
   */
  const saveEdit = (field: keyof Mode, value: string) => {
    updateMode(mode.slug, { [field]: value });
    setEditingField(null);
    onUpdate?.({ ...mode, [field]: value });
  };

  /**
   * Handle canceling edit mode
   */
  const cancelEdit = () => {
    setEditingField(null);
  };

  /**
   * Render editable field content
   */
  const renderField = (field: keyof Mode, label: string, isMultiline = false) => {
    const isEditing = editingField === field;
    const value = mode[field] as string;

    if (isEditing) {
      if (isMultiline) {
        return (
          <textarea
            defaultValue={value}
            onBlur={(e) => saveEdit(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                saveEdit(field, e.currentTarget.value);
              } else if (e.key === 'Escape') {
                cancelEdit();
              }
            }}
            className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 resize-none"
            rows={isMultiline ? (field === 'prompt' ? 8 : 3) : 1}
            autoFocus
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        );
      }

      return (
        <input
          type="text"
          defaultValue={value}
          onBlur={(e) => saveEdit(field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit(field, e.currentTarget.value);
            } else if (e.key === 'Escape') {
              cancelEdit();
            }
          }}
          className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200"
          autoFocus
        />
      );
    }

    return (
      <div
        className="cursor-pointer inline-block"
        onDoubleClick={() => startEdit(field)}
        title={`Double-click to edit ${label.toLowerCase()}`}
      >
        {field === 'prompt' ? (
          <div className="text-slate-700 whitespace-pre-line leading-relaxed" title={value}>
            {value.length > 150 ? `${value.substring(0, 150)}...` : value}
          </div>
        ) : (
          <span className="text-slate-700">{value}</span>
        )}
      </div>
    );
  };

  /**
   * Render simple editable value (for headers)
   */
  const renderSimpleField = (field: keyof Mode) => {
    const isEditing = editingField === field;
    const value = mode[field] as string;

    if (isEditing) {
      return (
        <input
          type="text"
          defaultValue={value}
          onBlur={(e) => saveEdit(field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit(field, e.currentTarget.value);
            } else if (e.key === 'Escape') {
              cancelEdit();
            }
          }}
          className="bg-transparent border-b-2 border-indigo-300 focus:outline-none focus:border-indigo-500 px-1"
          autoFocus
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:text-indigo-600 transition-colors"
        onDoubleClick={() => startEdit(field)}
        title={`Double-click to edit`}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header with editable name and slug */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {renderSimpleField('name')}
          </div>
          <div className="text-sm text-gray-500">
            {renderSimpleField('slug')}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {renderField('description', 'Description', true)}
        </div>

        {/* Usage Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usage Guidelines
          </label>
          {renderField('usage', 'Usage Guidelines', true)}
        </div>

        {/* Prompt Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          {renderField('prompt', 'System Prompt', true)}
        </div>
      </div>

      {/* Edit Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-600">
          💡 Double-click on any field to edit it. Press Enter to save or Escape to cancel.
        </p>
      </div>
    </div>
  );
};

export default ModeDetail;