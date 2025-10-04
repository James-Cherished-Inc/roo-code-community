import React, { useState } from 'react';
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
 * Table component for displaying and editing mode data
 */
const ModeTable: React.FC<ModeTableProps> = ({ modes }) => {
  const { updateMode, deleteMode } = useModes();
  const [editingCell, setEditingCell] = useState<{ slug: string; field: keyof Mode } | null>(null);

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
   * Render editable cell content
   */
  const renderCell = (mode: Mode, field: keyof Mode) => {
    const isEditing = editingCell?.slug === mode.slug && editingCell?.field === field;
    const value = mode[field] as string;

    if (isEditing) {
      if (field === 'prompt') {
        return (
          <textarea
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
            rows={3}
            autoFocus
            placeholder="Enter prompt content..."
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

    return (
      <div
        className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 px-3 py-2 rounded-lg min-h-[2.5rem] flex items-center transition-all duration-200 hover:shadow-sm border border-transparent hover:border-indigo-200/50"
        onClick={() => startEdit(mode.slug, field)}
        title="Click to edit"
      >
        {field === 'prompt' ? (
          <div className="text-slate-700 whitespace-pre-line leading-relaxed" title={value}>
            {value.length > 100 ? `${value.substring(0, 100)}...` : value}
          </div>
        ) : (
          <span className="text-slate-700">{value}</span>
        )}
      </div>
    );
  };

  return (
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
  );
};

export default ModeTable;