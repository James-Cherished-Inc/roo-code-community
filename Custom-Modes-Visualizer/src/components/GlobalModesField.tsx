import React, { useState } from 'react';
import { useModes } from '../context/ModeContext';

/**
 * Component for editing global configuration that applies to all modes
 */
const GlobalModesField: React.FC = () => {
  const { globalConfig, updateGlobalConfig } = useModes();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(globalConfig.forAllModes);

  /**
   * Handle starting edit mode
   */
  const startEdit = () => {
    setEditValue(globalConfig.forAllModes);
    setIsEditing(true);
  };

  /**
   * Handle saving changes
   */
  const saveEdit = () => {
    updateGlobalConfig({ forAllModes: editValue });
    setIsEditing(false);
  };

  /**
   * Handle canceling edit mode
   */
  const cancelEdit = () => {
    setEditValue(globalConfig.forAllModes);
    setIsEditing(false);
  };

  /**
   * Handle key events in textarea
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="mt-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 p-6 animate-fade-in-up">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🌐 For All Modes</h3>
        <p className="text-sm text-gray-600">
          Common instructions that will be applied to all modes. These will be prepended to each mode's prompt.
        </p>
      </div>

      <div className="relative">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 resize-vertical min-h-[100px]"
              placeholder="Enter global instructions for all modes..."
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter to save, Esc to cancel
            </p>
          </div>
        ) : (
          <div
            className="min-h-[80px] p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 bg-gray-50/50"
            onClick={startEdit}
            title="Click to edit global instructions"
          >
            {globalConfig.forAllModes ? (
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {globalConfig.forAllModes}
              </div>
            ) : (
              <div className="text-gray-400 italic">
                Click to add global instructions for all modes...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalModesField;