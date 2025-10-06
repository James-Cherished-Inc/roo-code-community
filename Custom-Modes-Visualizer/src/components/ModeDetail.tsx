import React, { useState, useEffect, useRef } from 'react';
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
 * Simple red cross icon component
 */
const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Simple copy icon component
 */
const CopyIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

/**
 * Delete confirmation modal component
 */
const DeleteConfirmationModal: React.FC<{
  modeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ modeName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete the mode "{modeName}"? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

/**
 * Component for displaying and editing a single mode in detail
 */
const ModeDetail: React.FC<ModeDetailProps> = ({ mode, onUpdate }) => {
  const { updateMode, deleteMode } = useModes();
  const [editingField, setEditingField] = useState<keyof Mode | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [textareaDimensions, setTextareaDimensions] = useState<{ [field: string]: { width: number; height: number } | null }>({});
  const [copyMessage, setCopyMessage] = useState(false);

  // Ref for the currently editing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Storage key for textarea dimensions per mode
  const getStorageKey = (field: string) => `mode-${mode.slug}-${field}-dimensions`;

  // Load saved dimensions from sessionStorage
   useEffect(() => {
     const savedDimensions: { [field: string]: { width: number; height: number } } = {};
     const fields = ['prompt', 'description', 'usage'];

     fields.forEach(field => {
       const storageKey = getStorageKey(field);
       const stored = sessionStorage.getItem(storageKey);
       if (stored) {
         try {
           const parsed = JSON.parse(stored);
           // Validate parsed data structure and ensure reasonable bounds
           if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
             // Ensure reasonable dimensions with upper bounds for maximum editing width
             savedDimensions[field] = {
               width: Math.max(Math.min(parsed.width, 1400), 1000), // Between 1000px and 1400px width for maximum editing width
               height: Math.max(Math.min(parsed.height, 600), 200) // Between 200px and 600px height
             };
           } else {
             console.warn(`Invalid dimension data for ${field}, removing corrupted data`);
             sessionStorage.removeItem(storageKey);
           }
         } catch (e) {
           console.warn(`Failed to parse stored dimensions for ${field}, cleaning up:`, e);
           sessionStorage.removeItem(storageKey);
         }
       }
     });

     setTextareaDimensions(savedDimensions);
   }, [mode.slug]);

  // Handle textarea resize and save dimensions
  const handleTextareaResize = (field: string) => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      // Use the actual dimensions from the textarea, with reasonable bounds for maximum editing width
      const dimensions = {
        width: Math.max(rect.width, 1000), // Minimum 1000px width for maximum editing width
        height: Math.min(Math.max(rect.height, 200), 600) // Between 200px and 600px height
      };
      setTextareaDimensions(prev => ({ ...prev, [field]: dimensions }));

      // Save to sessionStorage
      const storageKey = getStorageKey(field);
      sessionStorage.setItem(storageKey, JSON.stringify(dimensions));
    }
  };

  // Setup ResizeObserver for textarea resize detection
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !editingField) return;

    const resizeObserver = new ResizeObserver(() => {
      if (editingField) {
        handleTextareaResize(editingField);
      }
    });

    resizeObserver.observe(textarea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [editingField]);

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
   * Handle delete mode request
   */
  const handleDeleteMode = () => {
    setShowDeleteConfirmation(true);
  };

  /**
   * Handle confirmed delete
   */
  const confirmDelete = () => {
    deleteMode(mode.slug);
    setShowDeleteConfirmation(false);
  };

  /**
   * Handle cancel delete
   */
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  /**
   * Handle copying content to clipboard
   */
  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Show copy success message
      setCopyMessage(true);
      setTimeout(() => setCopyMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  /**
   * Render editable field content
   */
  const renderField = (field: keyof Mode, label: string, isMultiline = false) => {
    const isEditing = editingField === field;
    const value = mode[field] as string;

    if (isEditing) {
      if (isMultiline) {
        const savedDimensions = textareaDimensions[field];
        // Calculate default rows based on content length for prompts - more generous sizing
        const defaultRows = field === 'prompt'
          ? Math.max(10, Math.min(25, Math.ceil(value.length / 60))) // At least 10 rows, up to 25 rows based on content
          : 4;
        const style = savedDimensions ? {
          width: `${Math.max(savedDimensions.width, 1000)}px`, // Use saved width directly, minimum 1000px for maximum editing width
          height: `${Math.max(savedDimensions.height, 200)}px`, // Use saved height directly, minimum 200px
          minHeight: '200px', // Reasonable minimum height
          maxWidth: 'calc(100vw - 14rem)' // Leave space for sidebar and some margin
        } : {
          maxWidth: 'calc(100vw - 14rem)', // Leave space for sidebar and some margin
          minWidth: '1000px' // Minimum width for maximum editing width
        };

        return (
          <textarea
            ref={textareaRef}
            defaultValue={value}
            onBlur={(e) => saveEdit(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                saveEdit(field, e.currentTarget.value);
              } else if (e.key === 'Escape') {
                cancelEdit();
              }
            }}
            className="w-full px-3 py-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 resize whitespace-pre-line leading-relaxed pr-8 textarea-max-height"
            rows={savedDimensions ? undefined : defaultRows}
            style={style}
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
      <div className="relative w-full">
        <div
          className="cursor-pointer w-full"
          onDoubleClick={() => startEdit(field)}
          title={`Double-click to edit ${label.toLowerCase()}`}
        >
          {field === 'prompt' ? (
            <>
              {/* Copy button for prompt field only */}
              {value && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyToClipboard(value);
                  }}
                  className="absolute top-0 right-0 p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-sm hover:bg-indigo-50 z-10"
                  title="Copy prompt to clipboard"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
              )}
              <div className="text-slate-700 whitespace-pre-line leading-relaxed pr-8 w-full break-words" title={value}>
                {value}
              </div>
            </>
          ) : (
            <span className="text-slate-700">{value}</span>
          )}
        </div>
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
    <div className="bg-white shadow rounded-lg px-8 py-6 h-full w-full max-w-none">
      {/* Header with editable name and slug */}
      <div className="mb-6 pb-4 border-b border-gray-200 relative">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="text-2xl font-bold text-gray-900">
              {renderSimpleField('name')}
            </div>
            <div className="text-sm text-gray-500">
              {renderSimpleField('slug')}
            </div>
          </div>
          {/* Delete mode button */}
          <button
            onClick={handleDeleteMode}
            className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 flex-shrink-0"
            title="Delete mode"
          >
            <DeleteIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6 w-full max-w-none">
        {/* Description Field */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {renderField('description', 'Description', true)}
        </div>

        {/* Usage Field */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usage Guidelines
          </label>
          {renderField('usage', 'Usage Guidelines', true)}
        </div>

        {/* Prompt Field */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          {renderField('prompt', 'System Prompt', true)}
        </div>
      </div>


      {/* Edit Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-600">
          💡 Double-click on any field to edit it. Press Ctrl+Enter to save or Escape to cancel.
        </p>
      </div>

      {/* Copy success message */}
      {copyMessage && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm shadow-lg animate-fade-in-up">
          Prompt copied to clipboard! ✅
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          modeName={mode.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default ModeDetail;