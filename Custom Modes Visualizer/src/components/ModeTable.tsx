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
 * Table component for displaying and editing mode data
 */
const ModeTable: React.FC<ModeTableProps> = ({ modes }) => {
  const { updateMode } = useModes();
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
   * Render editable cell content
   */
  const renderCell = (mode: Mode, field: keyof Mode) => {
    const isEditing = editingCell?.slug === mode.slug && editingCell?.field === field;
    const value = mode[field] as string;

    if (isEditing) {
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
          <div className="truncate max-w-lg text-slate-700" title={value}>
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
            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider" style={{ width: '18%' }}>
              Description
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider" style={{ width: '8%' }}>
              Usage
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider rounded-tr-2xl" style={{ width: '74%' }}>
              Prompt
            </th>
</tr>
        </thead>
        <tbody className="bg-white/50 divide-y divide-slate-200/30">
          {modes.map((mode, index) => (
            <tr
              key={mode.slug}
              className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-xl"
            >
              <td className="pl-6 pr-5 py-4">
                <div className="flex flex-col gap-1">
                  <div className="ml-1">{renderCell(mode, 'name')}</div>
                  <div className="text-xs text-slate-500 flex items-center justify-center">
                    {renderCell(mode, 'slug')}
                  </div>
                </div>
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