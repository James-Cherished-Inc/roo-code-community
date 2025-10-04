import React, { useState, useMemo, useEffect } from 'react';
import { useModes } from '../context/ModeContext';
import ModeDetail from '../components/ModeDetail';
import CreateModeModal from '../components/CreateModeModal';
import FamilySelector from '../components/FamilySelector';

/**
 * Page component for smart view showing one mode at a time with navigation
 */
const SmartViewPage: React.FC = () => {
   const { modes, selectedFamilies } = useModes();
   const [selectedModeIndex, setSelectedModeIndex] = useState(0);
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   // Filter modes based on selected families
   const filteredModes = useMemo(() => {
     if (selectedFamilies.length === 0) return [];
     return modes.filter(mode => mode.family && selectedFamilies.includes(mode.family));
   }, [modes, selectedFamilies]);

   // Clamp selectedModeIndex when filteredModes changes
   useEffect(() => {
     if (selectedModeIndex >= filteredModes.length && filteredModes.length > 0) {
       setSelectedModeIndex(filteredModes.length - 1);
     }
   }, [filteredModes.length, selectedModeIndex]);

  const selectedMode = filteredModes[selectedModeIndex];

  /**
   * Handle navigation to previous mode
    */
   const goToPrevious = () => {
     setSelectedModeIndex(prev => (prev > 0 ? prev - 1 : filteredModes.length - 1));
   };

   /**
   * Handle navigation to next mode
    */
   const goToNext = () => {
     setSelectedModeIndex(prev => (prev < filteredModes.length - 1 ? prev + 1 : 0));
   };

  /**
   * Handle direct mode selection
   */
  const selectMode = (index: number) => {
    setSelectedModeIndex(index);
  };

  /**
   * Handle create mode button click
   */
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  if (filteredModes.length === 0) {
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
              0 of 0 modes
            </div>
            <div className="mt-2">
              <FamilySelector />
            </div>
          </div>

          {/* Mode Selection - Empty */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-center text-gray-400 text-xs mt-4">
              No modes in selected families
            </div>
          </div>

          {/* Navigation Controls - Disabled */}
          <div className="p-2 border-t border-gray-200">
            <div className="flex gap-1">
              <button
                className="flex-1 px-2 py-1 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-xs"
                disabled
              >
                ← Prev
              </button>
              <button
                className="flex-1 px-2 py-1 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-xs"
                disabled
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Empty */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-lg font-medium mb-1">No modes available</div>
              <div className="text-sm">Select families in the sidebar to view modes</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This variable is now declared after the early return check

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
             {selectedModeIndex + 1} of {filteredModes.length} modes
           </div>
           <div className="mt-2">
             <FamilySelector />
           </div>
         </div>

        {/* Mode Selection - Vertically Stacked */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {/* Create Mode Option */}
            <button
              onClick={handleCreate}
              className="w-full text-left p-2 rounded-lg transition-all duration-200 text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium"
            >
              <div className="font-semibold truncate">➕ Create Mode</div>
              <div className="text-xs mt-1 truncate text-green-600">
                Add new mode
              </div>
            </button>

            {filteredModes.map((mode, index) => (
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
              disabled={filteredModes.length <= 1}
            >
              ← Prev
            </button>
            <button
              onClick={goToNext}
              className="flex-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
              disabled={filteredModes.length <= 1}
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

      {/* Create Mode Modal */}
      <CreateModeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default SmartViewPage;