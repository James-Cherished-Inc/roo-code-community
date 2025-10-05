import React, { useState, useEffect, useRef } from 'react';
import type { Mode } from '../types';
import { useModes } from '../context/ModeContext';

/**
 * Props for the ModeTable component
 */
interface ModeTableProps {
  /** Array of modes to display */
  modes: Mode[];
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
 * Table component for displaying and editing mode data
 */
const ModeTable: React.FC<ModeTableProps> = ({ modes }) => {
  const { updateMode, deleteMode } = useModes();
  const [editingCell, setEditingCell] = useState<{ slug: string; field: keyof Mode } | null>(null);
  const [textareaDimensions, setTextareaDimensions] = useState<{ [key: string]: { width: number; height: number } | null }>({});
  const [copyMessage, setCopyMessage] = useState<{ show: boolean; modeName: string }>({ show: false, modeName: '' });

  // Ref for the currently editing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Storage key for textarea dimensions per mode and field
  const getStorageKey = (slug: string, field: string) => `table-${slug}-${field}-dimensions`;

  // Load saved dimensions from sessionStorage
  useEffect(() => {
    const savedDimensions: { [key: string]: { width: number; height: number } } = {};

    modes.forEach(mode => {
      const fields = ['prompt', 'description', 'usage'];
      fields.forEach(field => {
        const storageKey = getStorageKey(mode.slug, field);
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            // Validate the parsed data has required properties
            if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
              savedDimensions[storageKey] = parsed;
            } else {
              console.warn(`Invalid dimension data for ${field}:`, parsed);
              sessionStorage.removeItem(storageKey); // Clean up invalid data
            }
          } catch (e) {
            console.warn(`Failed to parse stored dimensions for ${field}:`, e);
            sessionStorage.removeItem(storageKey); // Clean up corrupted data
          }
        }
      });
    });

    setTextareaDimensions(savedDimensions);
  }, [modes]);

  // Clear stored dimensions for all modes
  const clearAllStoredDimensions = () => {
    modes.forEach(mode => {
      const fields = ['prompt', 'description', 'usage'];
      fields.forEach(field => {
        const storageKey = getStorageKey(mode.slug, field);
        sessionStorage.removeItem(storageKey);
      });
    });
    // Clear state to force re-render
    setTextareaDimensions({});
    console.log('All table dimensions cleared');
  };

  // Make clear function available globally for testing
  if (typeof window !== 'undefined') {
    (window as any).clearTableDimensions = clearAllStoredDimensions;
  }

  // Listen for hard refresh to clear dimensions
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear dimensions when page is refreshed/closed
      clearAllStoredDimensions();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // Empty dependency array - only run once on mount

  // Handle textarea resize and save dimensions
  const handleTextareaResize = (slug: string, field: string) => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      const dimensions = { width: rect.width, height: rect.height };
      const storageKey = getStorageKey(slug, field);
      setTextareaDimensions(prev => ({ ...prev, [storageKey]: dimensions }));

      // Save to sessionStorage
      sessionStorage.setItem(storageKey, JSON.stringify(dimensions));
    }
  };

  // Setup ResizeObserver for textarea resize detection
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !editingCell) return;

    const resizeObserver = new ResizeObserver(() => {
      if (editingCell) {
        handleTextareaResize(editingCell.slug, editingCell.field);
      }
    });

    resizeObserver.observe(textarea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [editingCell]);

  /**
   * Handle starting edit mode for a cell
   */
  const startEdit = (slug: string, field: keyof Mode) => {
    setEditingCell({ slug, field });
  };

  /**
   * Handle saving changes to a cell
   */
  const saveEdit = (slug: string, field: keyof Mode, value: string) => {
    updateMode(slug, { [field]: value });
    setEditingCell(null);
  };

  /**
   * Handle canceling edit mode
   */
  const cancelEdit = () => {
    setEditingCell(null);
  };

  /**
   * Handle delete mode request - immediate deletion without confirmation
   */
  const handleDeleteMode = (mode: Mode) => {
    deleteMode(mode.slug);
  };

  /**
   * Handle copying content to clipboard
   */
  const handleCopyToClipboard = async (content: string, modeName?: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Show copy success message
      if (modeName) {
        setCopyMessage({ show: true, modeName });
        setTimeout(() => setCopyMessage({ show: false, modeName: '' }), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  /**
   * Render editable cell content
   */
  const renderCell = (mode: Mode, field: keyof Mode) => {
    const isEditing = editingCell?.slug === mode.slug && editingCell?.field === field;
    const value = mode[field] as string;

    if (isEditing) {
      // Check if this field should use textarea (multi-line editing)
      if (field === 'prompt' || field === 'description' || field === 'usage') {
        const storageKey = getStorageKey(mode.slug, field);
        const savedDimensions = textareaDimensions[storageKey];
        const style = savedDimensions ? {
          width: `${savedDimensions.width}px`,
          height: `${savedDimensions.height}px`,
          minHeight: '40px' // Minimum height for table cell
        } : {};

        return (
          <textarea
            ref={textareaRef}
            defaultValue={value}
            onBlur={(e) => saveEdit(mode.slug, field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                saveEdit(mode.slug, field, e.currentTarget.value);
              } else if (e.key === 'Escape') {
                cancelEdit();
              }
            }}
            className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 resize"
            rows={savedDimensions ? undefined : 3}
            style={style}
            autoFocus
            placeholder={`Enter ${field} content...`}
          />
        );
      }

      return (
        <input
          type="text"
          defaultValue={value}
          onBlur={(e) => saveEdit(mode.slug, field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit(mode.slug, field, e.currentTarget.value);
            } else if (e.key === 'Escape') {
              cancelEdit();
            }
          }}
          className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200"
          autoFocus
        />
      );
    }

    const storageKey = getStorageKey(mode.slug, field);
    const savedDimensions = (field === 'prompt' || field === 'description' || field === 'usage') ? textareaDimensions[storageKey] : null;

    // Apply saved dimensions to the cell display for multi-line fields
    const cellStyle = savedDimensions ? {
      width: `${savedDimensions.width}px`,
      minHeight: `${Math.max(savedDimensions.height, 60)}px`,
      height: 'auto',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-start',
      padding: '8px 12px',
      borderRadius: '8px'
    } : {};

    return (
      <div
        className={`relative cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 px-3 py-2 rounded-lg min-h-[2.5rem] flex items-center transition-all duration-200 hover:shadow-sm border border-transparent hover:border-indigo-200/50 ${savedDimensions ? 'justify-start' : 'justify-center'}`}
        onClick={() => startEdit(mode.slug, field)}
        title="Click to edit"
        style={cellStyle}
      >
        {(field === 'prompt' || field === 'description' || field === 'usage') ? (
          <>
            {/* Copy button for prompt field only */}
            {field === 'prompt' && value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyToClipboard(value, mode.name);
                }}
                className="absolute top-1 right-1 p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-sm hover:bg-indigo-50 z-10"
                title="Copy prompt to clipboard"
              >
                <CopyIcon className="w-4 h-4" />
              </button>
            )}
            <div className="text-slate-700 w-full h-full pr-6" title={value} style={{
              height: savedDimensions ? `${savedDimensions.height - 16}px` : 'auto',
              overflow: 'hidden',
              wordWrap: 'break-word',
              whiteSpace: 'pre-line',
              lineHeight: '1.4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: savedDimensions ? Math.floor((savedDimensions.height - 16) / 20) : 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.4'
              }}>
                {value}
              </div>
            </div>
          </>
        ) : (
          <span className="text-slate-700">{value}</span>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 animate-fade-in-up">
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80">
            <tr>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider rounded-tl-2xl" style={{ width: '0%' }}>
                Name & Slug
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider" style={{ width: '22%' }}>
                Description
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider" style={{ width: '12%' }}>
                Usage
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider rounded-tr-2xl" style={{ width: '66%' }}>
                Prompt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 divide-y divide-slate-200/30">
            {modes.map((mode) => (
              <tr
                key={mode.slug}
                className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-xl relative"
              >
                <td className="pl-6 pr-5 py-4 relative">
                  <div className="flex flex-col gap-1">
                    <div className="ml-1">{renderCell(mode, 'name')}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center">
                      {renderCell(mode, 'slug')}
                    </div>
                  </div>
                  {/* Delete button - appears on row hover */}
                  <button
                    onClick={() => handleDeleteMode(mode)}
                    className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 p-1 rounded-full hover:bg-red-50"
                    title="Delete mode"
                  >
                    <DeleteIcon className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs">{renderCell(mode, 'description')}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs">{renderCell(mode, 'usage')}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs">{renderCell(mode, 'prompt')}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Copy success message */}
      {copyMessage.show && (
        <div className="absolute top-2 right-2 bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-md text-sm shadow-lg animate-fade-in-up">
          "{copyMessage.modeName}" prompt copied! ✅
        </div>
      )}
    </div>
  );
};

export default ModeTable;