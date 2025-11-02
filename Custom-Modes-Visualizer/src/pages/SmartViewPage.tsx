import React, { useState, useMemo, useEffect } from 'react';
import { useModes } from '../context/ModeContext';
import ModeDetail from '../components/ModeDetail';
import CreateModeModal from '../components/CreateModeModal';
import ImportModal from '../components/ImportModal';
import ExportModal from '../components/ExportModal';
import FamilySelector from '../components/FamilySelector';
import RedundancyHighlighter from '../components/RedundancyHighlighter';

/**
 * Page component for smart view showing one mode at a time with navigation
 */
const SmartViewPage: React.FC = () => {
    const { modes, selectedFamilies } = useModes();
    const [selectedModeIndex, setSelectedModeIndex] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isRedundancyPanelCollapsed, setIsRedundancyPanelCollapsed] = useState(false);

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

  /**
   * Handle import button click
   */
  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  /**
   * Handle export modes (opens modal)
   */
  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  /**
   * Handle redundancy panel toggle
   */
  const toggleRedundancyPanel = () => {
    setIsRedundancyPanelCollapsed(!isRedundancyPanelCollapsed);
  };

  if (filteredModes.length === 0) {
    return (
      <div className="flex w-screen fixed inset-x-0 top-20 bottom-0" style={{ margin: 0, padding: 0, height: 'calc(100vh - 5rem)' }}>
        {/* Left Sidebar - Mode Selection */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900 mb-2">🎯 Smart View</h1>
            <p className="text-xs text-gray-600">
              Select a mode to view and edit
            </p>
            <div className="mt-2 text-xs text-gray-500">
              0 modes loaded
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
    <div className="flex w-screen fixed inset-x-0 top-20 bottom-0" style={{ margin: 0, padding: 0, height: 'calc(100vh - 5rem)' }}>
      {/* Left Sidebar - Mode Selection */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
         <div className="p-4 border-b border-gray-200">
           <h1 className="text-lg font-bold text-gray-900 mb-2">🎯 Smart View</h1>
           <p className="text-xs text-gray-600">
             Select a mode to view and edit
           </p>
           {/* Import/Export Controls */}
           <div className="mt-2 flex flex-col space-y-1">
             <button
               onClick={handleExport}
               className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-3 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
               title="Export selected modes in JSON or YAML format"
             >
               <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Export
             </button>
             <button
               onClick={handleImport}
               className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-3 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
             >
               <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
               </svg>
               Import
             </button>
           </div>
           <div className="mt-2 text-xs text-gray-500">
             {filteredModes.length} modes loaded
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
      <div className="flex-1 flex overflow-hidden">
        {/* Main Panel - Mode Detail */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto">
            <ModeDetail
              mode={selectedMode}
              onPrevious={goToPrevious}
              onNext={goToNext}
              navigationDisabled={filteredModes.length <= 1}
            />
          </div>
        </div>

        {/* Collapsible Right Panel - Cross-Mode Redundancy Analysis */}
        {filteredModes.length > 1 && (
          <div className={`${
            isRedundancyPanelCollapsed ? 'w-12' : 'w-64 sm:w-80 lg:w-96'
          } bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
            {/* Collapsed State - Just Toggle Button */}
            {isRedundancyPanelCollapsed ? (
              <div className="flex flex-col items-center justify-center h-full p-2">
                <button
                  onClick={toggleRedundancyPanel}
                  className="w-full h-full min-h-[48px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                  title="Expand Cross-Mode Redundancy Analysis Panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Expanded State - Full Panel */
              <>
                {/* Panel Header with Collapse Button */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      🔍 Cross-Mode Redundancy Analysis
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Compare prompts across all modes
                    </p>
                  </div>
                  <button
                    onClick={toggleRedundancyPanel}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    title="Collapse Cross-Mode Redundancy Analysis Panel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>


                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto">
                  <RedundancyHighlighter
                    prompts={filteredModes.map(m => ({
                      content: m.prompt,
                      id: m.slug,
                      name: m.name
                    }))}
                    showPromptNames={true}
                    className="max-w-none"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        availableModes={filteredModes}
      />

      {/* Create Mode Modal */}
      <CreateModeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default SmartViewPage;