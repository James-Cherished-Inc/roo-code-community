import React from 'react';
import { useModes } from '../context/ModeContext';
import ModeTable from '../components/ModeTable';

/**
 * Page component for displaying all modes in an editable table view
 */
const TableViewPage: React.FC = () => {
  const { modes } = useModes();

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
          <span className="text-sm text-gray-500">
            {modes.length} mode{modes.length !== 1 ? 's' : ''} loaded
          </span>
        </div>
      </div>

      <ModeTable modes={modes} />
    </div>
  );
};

export default TableViewPage;