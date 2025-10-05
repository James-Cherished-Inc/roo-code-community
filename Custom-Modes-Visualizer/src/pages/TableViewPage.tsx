import React, { useState, useMemo } from 'react';
import { useModes } from '../context/ModeContext';
import ModeTable from '../components/ModeTable';
import ImportModal from '../components/ImportModal';
import ExportModal from '../components/ExportModal';
import CreateModeModal from '../components/CreateModeModal';
import ResetConfirmationModal from '../components/ResetConfirmationModal';
import FamilySelector from '../components/FamilySelector';
import GlobalModesField from '../components/GlobalModesField';

/**
 * Page component for displaying all modes in an editable table view
 */
const TableViewPage: React.FC = () => {
     const { modes, selectedFamilies, resetModes } = useModes();
     const [isImportModalOpen, setIsImportModalOpen] = useState(false);
     const [isExportModalOpen, setIsExportModalOpen] = useState(false);
     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
     const [isResetModalOpen, setIsResetModalOpen] = useState(false);

   // Filter modes based on selected families
   const filteredModes = useMemo(() => {
     if (selectedFamilies.length === 0) return [];
     return modes.filter(mode => mode.family && selectedFamilies.includes(mode.family));
   }, [modes, selectedFamilies]);

  /**
   * Handle export modes (opens modal)
   */
  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  /**
   * Handle import button click
   */
  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  /**
    * Handle create mode button click
    */
   const handleCreate = () => {
     setIsCreateModalOpen(true);
   };

  /**
    * Handle reset modes button click
    */
   const handleReset = () => {
     setIsResetModalOpen(true);
   };

   /**
    * Handle reset confirmation
    */
   const handleResetConfirm = () => {
     // Clear stored table dimensions before reset
     const modes = filteredModes.length > 0 ? filteredModes : [];
     modes.forEach(mode => {
       const fields = ['prompt', 'description', 'usage'];
       fields.forEach(field => {
         const storageKey = `table-${mode.slug}-${field}-dimensions`;
         sessionStorage.removeItem(storageKey);
       });
     });

     resetModes();
     // Perform hard refresh after reset
     window.location.reload();
   };

  return (
    <div className="px-5 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Table View</h1>
        <p className="text-gray-600">
          Edit all modes in a comprehensive table. Click on any cell to edit the content.
        </p>
      </div>

      <div className="mb-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <FamilySelector />
             <span className="text-sm text-gray-500">
               {filteredModes.length} mode{filteredModes.length !== 1 ? 's' : ''} loaded
             </span>

             <button
               onClick={handleReset}
               className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
               title="Reset all modes to default state and refresh page"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 15-6-6m0 0 6-6m-6 6h12a6 6 0 0 1 0 12h-3" />
               </svg>
             </button>
           </div>

          {/* Import/Export Controls */}
          <div className="flex space-x-2">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Mode
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Export selected modes in JSON or YAML format"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Export Modes
            </button>

            <button
              onClick={handleImport}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import
            </button>
          </div>
        </div>
      </div>

      <ModeTable modes={filteredModes} />

      <GlobalModesField />

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

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        message="Are you sure you want to reset all modes to their default state? This action will:

• Reset all modes to the original default modes
• Remove all custom modes
• Reset families to default and standalone
• Clear all local data
• Refresh the page to apply changes

This action cannot be undone."
      />
    </div>
  );
};

export default TableViewPage;