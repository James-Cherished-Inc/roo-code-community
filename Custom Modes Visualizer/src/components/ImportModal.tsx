import React, { useState, useRef } from 'react';
import { useModes } from '../context/ModeContext';

/**
 * Props for the ImportModal component
 */
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for importing modes from JSON files with different merge strategies
 */
// Import the importFromFile function from context
const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { importFromFile } = useModes();
  const [importStrategy, setImportStrategy] = useState<'replace' | 'add' | 'family'>('add');
  const [familyName, setFamilyName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection and import
   */
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate family name if using family strategy
    if (importStrategy === 'family' && (!familyName || familyName.trim() === '')) {
      setError('Please enter a family name for the imported modes');
      return;
    }

    const isYamlFile = file.name.toLowerCase().endsWith('.yaml') || file.name.toLowerCase().endsWith('.yml');
    const isJsonFile = file.name.toLowerCase().endsWith('.json');

    if (!isYamlFile && !isJsonFile) {
      setError('Please select a valid JSON or YAML file (.json, .yaml, or .yml)');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await importFromFile(file, importStrategy, importStrategy === 'family' ? familyName : undefined);

      if (success) {
        const formatName = isYamlFile ? 'YAML' : 'JSON';
        const strategyText = importStrategy === 'family' && familyName ? `${importStrategy} (${familyName})` : importStrategy;
        setSuccess(`Successfully imported modes from ${formatName} file using ${strategyText} strategy`);
        setTimeout(() => {
          onClose();
          // Reset form after successful import
          setSuccess(null);
          setImportStrategy('add');
          setFamilyName('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1500);
      } else {
        setError('Failed to import modes. Please check the file format and try again.');
      }
    } catch (err) {
      const formatName = isYamlFile ? 'YAML' : 'JSON';
      setError(`Invalid ${formatName} file format or file structure`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle strategy change
   */
  const handleStrategyChange = (strategy: 'replace' | 'add' | 'family') => {
    setImportStrategy(strategy);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Import Modes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Import Strategy Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Import Strategy</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="importStrategy"
                value="replace"
                checked={importStrategy === 'replace'}
                onChange={() => handleStrategyChange('replace')}
                className="mr-2"
                disabled={isProcessing}
              />
              <div>
                <div className="font-medium text-gray-900">Replace current modes</div>
                <div className="text-sm text-gray-500">Completely replace all existing modes with imported ones</div>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="importStrategy"
                value="add"
                checked={importStrategy === 'add'}
                onChange={() => handleStrategyChange('add')}
                className="mr-2"
                disabled={isProcessing}
              />
              <div>
                <div className="font-medium text-gray-900">Add to current modes</div>
                <div className="text-sm text-gray-500">Append imported modes to existing modes</div>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="importStrategy"
                value="family"
                checked={importStrategy === 'family'}
                onChange={() => handleStrategyChange('family')}
                className="mr-2"
                disabled={isProcessing}
              />
              <div>
                <div className="font-medium text-gray-900">Import as family</div>
                <div className="text-sm text-gray-500">Keep current modes and add imported ones as a group</div>
              </div>
            </label>
          </div>
        </div>

        {/* Family Name Input (only for family strategy) */}
        {importStrategy === 'family' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter family name for imported modes"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              All imported modes will be grouped under this family name
            </p>
          </div>
        )}

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select JSON or YAML File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml"
            onChange={handleFileImport}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isProcessing}
          />
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
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;