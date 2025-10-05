import React, { useState } from 'react';
import { useModes } from '../context/ModeContext';
import type { Mode, FormatType } from '../types';

/**
 * Warning icon component for tooltips
 */
const WarningIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

/**
 * Props for the ExportModal component
 */
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableModes: Mode[];
}

/**
 * Modal component for exporting selected modes in JSON or YAML format
 */
const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, availableModes }) => {
  const { exportSelectedModes } = useModes();
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<FormatType>('json');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Handle mode selection toggle
   */
  const handleModeToggle = (slug: string) => {
    const newSelected = new Set(selectedSlugs);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setSelectedSlugs(newSelected);
    setError(null);
  };

  /**
   * Handle select all modes
   */
  const handleSelectAll = () => {
    const allSlugs = new Set(availableModes.map(mode => mode.slug));
    setSelectedSlugs(allSlugs);
    setError(null);
  };

  /**
   * Handle select none
   */
  const handleSelectNone = () => {
    setSelectedSlugs(new Set());
    setError(null);
  };

  /**
   * Handle export process
   */
  const handleExport = async () => {
    if (selectedSlugs.size === 0) {
      setError('Please select at least one mode to export');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const slugsArray = Array.from(selectedSlugs);
      const success = exportSelectedModes(exportFormat, slugsArray);

      if (success) {
        setSuccess(`Successfully exported ${selectedSlugs.size} mode(s) as ${exportFormat.toUpperCase()}`);
        setTimeout(() => {
          onClose();
          // Reset form after successful export
          setSuccess(null);
          setSelectedSlugs(new Set());
          setExportFormat('json');
        }, 1500);
      } else {
        setError('Failed to export modes. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during export');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isProcessing) {
      setSelectedSlugs(new Set());
      setExportFormat('json');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Export Modes</h2>
            <div className="relative group">
              <WarningIcon className="w-5 h-5 text-amber-500 hover:text-amber-600 cursor-help transition-colors duration-200" />
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                "🌐 All-Modes Custom Instructions" field is not exported
                <br />
                So exported files can work out-of-the-box with Roo Code.
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Export Format</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="json"
                checked={exportFormat === 'json'}
                onChange={() => setExportFormat('json')}
                className="mr-2"
                disabled={isProcessing}
              />
              <span className="font-medium text-gray-900">JSON</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="yaml"
                checked={exportFormat === 'yaml'}
                onChange={() => setExportFormat('yaml')}
                className="mr-2"
                disabled={isProcessing}
              />
              <span className="font-medium text-gray-900">YAML</span>
            </label>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Select Modes to Export ({selectedSlugs.size} selected)
            </h3>
            <div className="space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                disabled={isProcessing}
              >
                Select All
              </button>
              <button
                onClick={handleSelectNone}
                className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                disabled={isProcessing}
              >
                Select None
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            <div className="divide-y divide-gray-200">
              {availableModes.map((mode) => (
                <label
                  key={mode.slug}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSlugs.has(mode.slug)}
                    onChange={() => handleModeToggle(mode.slug)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {mode.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {mode.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing || selectedSlugs.size === 0}
          >
            {isProcessing ? 'Exporting...' : `Export ${selectedSlugs.size} Mode${selectedSlugs.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;