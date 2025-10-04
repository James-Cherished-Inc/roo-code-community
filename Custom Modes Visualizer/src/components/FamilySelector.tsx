import React, { useState, useRef, useEffect } from 'react';
import { useModes } from '../context/ModeContext';
import type { ModeFamily } from '../types';

interface FamilyImportData {
  family: ModeFamily;
  modes: import('../types').Mode[];
}

/**
 * Multi-select dropdown component for choosing mode families to display
 */
const FamilySelector: React.FC = () => {
  const { families, selectedFamilies, setSelectedFamilies, importFamilyFromJson } = useModes();
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle family selection
  const toggleFamily = (familyId: string) => {
    const newSelection = selectedFamilies.includes(familyId)
      ? selectedFamilies.filter(id => id !== familyId)
      : [...selectedFamilies, familyId];
    setSelectedFamilies(newSelection);
  };

  // Select all families
  const selectAll = () => {
    setSelectedFamilies(families.map(f => f.id));
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedFamilies([]);
  };

  // Handle family import
  const handleImportFamily = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a valid JSON file');
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData: FamilyImportData = JSON.parse(text);

      if (!importData.family || !importData.modes) {
        throw new Error('Invalid family import format');
      }

      const success = importFamilyFromJson(importData.family, importData.modes);
      if (success) {
        alert(`Successfully imported family "${importData.family.name}" with ${importData.modes.length} modes`);
      } else {
        alert('Failed to import family. Please check the file format.');
      }
    } catch (error) {
      alert('Invalid JSON file format for family import');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input for import
  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  // Get display text for selected families
  const getDisplayText = () => {
    if (selectedFamilies.length === 0) return 'No families selected';
    if (selectedFamilies.length === families.length) return 'All';
    if (selectedFamilies.length === 1) {
      const family = families.find(f => f.id === selectedFamilies[0]);
      return family?.name || '1 family';
    }
    return `${selectedFamilies.length} families`;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-28 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <span className="truncate">{getDisplayText()}</span>
          <svg
            className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2 space-y-1">
              {/* Select All / Clear All */}
              <div className="flex space-x-1 mb-2">
                <button
                  onClick={selectAll}
                  className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                >
                  Clear All
                </button>
              </div>

              {/* Family checkboxes */}
              {families.map((family: ModeFamily) => (
                <label key={family.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedFamilies.includes(family.id)}
                    onChange={() => toggleFamily(family.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    {family.color && (
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: family.color }}
                      />
                    )}
                    <span className="text-sm text-gray-700">{family.name}</span>
                    {family.isDefault && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">Default</span>
                    )}
                    {family.id === 'standalone' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">Auto</span>
                    )}
                  </div>
                </label>
              ))}

              {/* Import Family Option */}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  onClick={triggerImport}
                  disabled={isImporting}
                  className="w-full flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm text-gray-700 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>{isImporting ? 'Importing...' : 'Import family...'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFamily}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FamilySelector;