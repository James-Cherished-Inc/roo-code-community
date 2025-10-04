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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Smart View</h1>
        <p className="text-gray-600">
          View and edit one mode at a time with easy navigation.
        </p>
      </div>

      {/* Mode Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevious}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            disabled={modes.length <= 1}
          >
            ← Previous
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-500">
              {selectedModeIndex + 1} of {modes.length}
            </span>
          </div>

          <button
            onClick={goToNext}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            disabled={modes.length <= 1}
          >
            Next →
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {modes.map((mode, index) => (
            <button
              key={mode.slug}
              onClick={() => selectMode(index)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                index === selectedModeIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Detail */}
      <ModeDetail mode={selectedMode} />

      {/* Navigation Footer */}
      <div className="mt-6 flex justify-center">
        <div className="text-sm text-gray-500">
          Use arrow keys or click tabs to navigate between modes
        </div>
      </div>
    </div>
  );
};

export default SmartViewPage;