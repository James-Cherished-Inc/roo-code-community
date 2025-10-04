import React, { useState } from 'react';
import { useModes } from '../context/ModeContext';
import ModeDetail from '../components/ModeDetail';

/**
 * Page component for smart view showing one mode at a time with navigation
 */
const SmartViewPage: React.FC = () => {
  const { modes } = useModes();
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);

  const selectedMode = modes[selectedModeIndex];

  /**
   * Handle navigation to previous mode
   */
  const goToPrevious = () => {
    setSelectedModeIndex(prev => (prev > 0 ? prev - 1 : modes.length - 1));
  };

  /**
   * Handle navigation to next mode
   */
  const goToNext = () => {
    setSelectedModeIndex(prev => (prev < modes.length - 1 ? prev + 1 : 0));
  };

  /**
   * Handle direct mode selection
   */
  const selectMode = (index: number) => {
    setSelectedModeIndex(index);
  };

  if (!selectedMode) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          No modes available
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Mode Selection */}
      <div className="w-40 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900 mb-2">🎯 Smart View</h1>
          <p className="text-xs text-gray-600">
            Select a mode to view and edit
          </p>
          <div className="mt-2 text-xs text-gray-500">
            {selectedModeIndex + 1} of {modes.length} modes
          </div>
        </div>

        {/* Mode Selection - Vertically Stacked */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {modes.map((mode, index) => (
              <button
                key={mode.slug}
                onClick={() => selectMode(index)}
                className={`w-full text-left p-2 rounded-lg transition-all duration-200 text-sm ${
                  index === selectedModeIndex
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="font-medium truncate">{mode.name}</div>
                <div className={`text-xs mt-1 truncate ${
                  index === selectedModeIndex
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}>
                  {mode.slug}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="p-2 border-t border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={goToPrevious}
              className="flex-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
              disabled={modes.length <= 1}
            >
              ← Prev
            </button>
            <button
              onClick={goToNext}
              className="flex-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
              disabled={modes.length <= 1}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mode Detail - Full Content Area */}
        <div className="flex-1 overflow-y-auto">
          <ModeDetail mode={selectedMode} />
        </div>
      </div>
    </div>
  );
};

export default SmartViewPage;