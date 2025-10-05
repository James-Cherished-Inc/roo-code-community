import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Mode, ModeContextType, ModeFamily, FormatType, GlobalConfig } from '../types';

// Load initial data from JSON file
import modesData from '../data/modes.json';
import defaultFamilyData from '../data/default-family.json';
import standaloneFamilyData from '../data/standalone-family.json';

// Import conversion utilities
import {
  modeToExportMode,
  exportModeToMode,
  detectFileFormat,
  parseFileContent,
  validateExportFormat,
  serializeExportFormat,
  downloadFile,
  resolveSlugConflicts
} from '../utils/formatConversion';

const MODES_STORAGE_KEY = 'roo-modes-visualizer-modes';
const FAMILIES_STORAGE_KEY = 'roo-modes-visualizer-families';
const SELECTED_FAMILIES_STORAGE_KEY = 'roo-modes-visualizer-selected-families';
const GLOBAL_MODES_CONFIG_KEY = 'roo-modes-visualizer-global-config';

/**
 * Context for managing mode and family data throughout the application
 */
const ModeContext = createContext<ModeContextType | undefined>(undefined);

/**
 * Provider component that manages the mode state
 */
export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   // Initialize state with data from JSON file
    const [modes, setModes] = useState<Mode[]>(modesData);
    const [families, setFamilies] = useState<ModeFamily[]>([defaultFamilyData, standaloneFamilyData]);
    const [selectedFamilies, setSelectedFamilies] = useState<string[]>(['default', 'standalone']);
    const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({ forAllModes: '' });

  /**
   * Update a specific mode by slug
   */
  const updateMode = (slug: string, updates: Partial<Mode>) => {
    setModes(prevModes =>
      prevModes.map(mode =>
        mode.slug === slug ? { ...mode, ...updates } : mode
      )
    );
  };

  /**
   * Update the global configuration
   */
  const updateGlobalConfig = (updates: Partial<GlobalConfig>) => {
    setGlobalConfig(prevConfig => ({ ...prevConfig, ...updates }));
  };

  /**
   * Add a new mode
   */
  const addMode = (mode: Mode) => {
    setModes(prevModes => [...prevModes, mode]);
  };

  /**
   * Delete a mode by slug
   */
  const deleteMode = (slug: string) => {
    setModes(prevModes => prevModes.filter(mode => mode.slug !== slug));
  };

  /**
   * Add a new family
   */
  const addFamily = (family: ModeFamily) => {
    setFamilies(prevFamilies => [...prevFamilies, family]);
  };

  /**
   * Update a family by id
   */
  const updateFamily = (id: string, updates: Partial<ModeFamily>) => {
    setFamilies(prevFamilies =>
      prevFamilies.map(family =>
        family.id === id ? { ...family, ...updates } : family
      )
    );
  };

  /**
   * Delete a family by id
   */
  const deleteFamily = (id: string) => {
    if (id === 'default') return; // Can't delete default family
    setFamilies(prevFamilies => prevFamilies.filter(family => family.id !== id));
    // Also remove from selected families
    setSelectedFamilies(prevSelected => prevSelected.filter(familyId => familyId !== id));
  };

  /**
   * Save current modes and families to localStorage
    */
   const saveToLocalStorage = () => {
     try {
       localStorage.setItem(MODES_STORAGE_KEY, JSON.stringify(modes));
       localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(families));
       localStorage.setItem(SELECTED_FAMILIES_STORAGE_KEY, JSON.stringify(selectedFamilies));
       localStorage.setItem(GLOBAL_MODES_CONFIG_KEY, JSON.stringify(globalConfig));
     } catch (error) {
       console.error('Failed to save data to localStorage:', error);
     }
   };

  /**
   * Export modes to JSON file (merge all families except Default)
    */
   const exportModesToJson = () => {
     try {
       // Get all modes except those from the Default family
       const customModes = modes.filter(mode => mode.family !== 'default');
       const dataStr = JSON.stringify(customModes, null, 2);
       const dataBlob = new Blob([dataStr], { type: 'application/json' });
       const url = URL.createObjectURL(dataBlob);
       const link = document.createElement('a');
       link.href = url;
       link.download = 'roo-modes-export.json';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
       return true;
     } catch (error) {
       console.error('Failed to export modes to JSON:', error);
       return false;
     }
   };

  /**
   * Export a specific family to JSON file
   */
  const exportFamilyToJson = (familyId: string) => {
    try {
      const family = families.find(f => f.id === familyId);
      const familyModes = modes.filter(mode => mode.family === familyId);

      if (!family) {
        throw new Error('Family not found');
      }

      const exportData = {
        family: family,
        modes: familyModes
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roo-family-${familyId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to export family to JSON:', error);
      return false;
    }
  };

  /**
   * Import family from JSON file
   */
  const importFamilyFromJson = (familyData: ModeFamily, modesData: Mode[], newFamilyName?: string) => {
    try {
      // Validate family data
      if (!familyData.id || !familyData.name) {
        throw new Error('Invalid family format');
      }

      // Validate modes data
      for (const mode of modesData) {
        if (!mode.slug || !mode.name) {
          throw new Error('Invalid mode format in family import');
        }
      }

      // Use new family name if provided, otherwise use original
      const finalFamilyName = newFamilyName?.trim() || familyData.name;
      const finalFamilyId = newFamilyName ? finalFamilyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : familyData.id;

      // Create new family data with updated name/id if necessary
      const finalFamilyData: ModeFamily = {
        ...familyData,
        name: finalFamilyName,
        id: finalFamilyId
      };

      // Add family if it doesn't exist
      const existingFamily = families.find(f => f.id === finalFamilyId);
      if (!existingFamily) {
        addFamily(finalFamilyData);
      }

      // Add modes with family assignment
      const modesWithFamily = modesData.map(mode => ({
        ...mode,
        family: finalFamilyId
      }));

      setModes(prevModes => [...prevModes, ...modesWithFamily]);
      return true;
    } catch (error) {
      console.error('Failed to import family from JSON:', error);
      return false;
    }
  };

   /**
    * Export selected modes in specified format
    */
   const exportSelectedModes = (format: FormatType, selectedSlugs: string[]): boolean => {
     try {
       // Get selected modes
       const selectedModes = modes.filter(mode => selectedSlugs.includes(mode.slug));

       if (selectedModes.length === 0) {
         console.error('No modes selected for export');
         return false;
       }

       // Convert to export format
       const exportModes = selectedModes.map(modeToExportMode);
       const exportData = { customModes: exportModes };

       // Serialize to string
       const content = serializeExportFormat(exportData, format);

       // Download file
       const mimeType = format === 'json' ? 'application/json' : 'application/x-yaml';
       const extension = format === 'json' ? '.json' : '.yaml';
       const filename = `roo-modes-export${extension}`;

       downloadFile(content, filename, mimeType);
       return true;
     } catch (error) {
       console.error('Failed to export selected modes:', error);
       return false;
     }
   };

   /**
    * Import modes from file (auto-detects format)
    * Returns success status and information about any renamed modes
    */
   const importFromFile = async (file: File, strategy: 'replace' | 'add' | 'family' = 'add', familyName?: string): Promise<{ success: boolean, renamedModes: { original: string, new: string }[] }> => {
     try {
       // Detect format from filename
       const format = detectFileFormat(file.name);
       if (!format) {
         console.error('Unsupported file format. Please use .json or .yaml/.yml files');
         return { success: false, renamedModes: [] };
       }

       // Read file content
       const text = await file.text();

       // Parse content
       const parsedData = parseFileContent(text, format);

       // Validate structure
       if (!validateExportFormat(parsedData)) {
         console.error('Invalid file structure. Expected { customModes: [...] }');
         return { success: false, renamedModes: [] };
       }

       // Convert to internal format
       const modes = parsedData.customModes.map(exportModeToMode);

       // Import using existing logic with strategy
       return importModesFromJson(modes, strategy, familyName);
     } catch (error) {
       console.error('Failed to import from file:', error);
       return { success: false, renamedModes: [] };
     }
   };

  /**
   * Import modes from JSON file with different merge strategies
   * Returns success status and information about any renamed modes
   */
  const importModesFromJson = (jsonData: Mode[], strategy: 'replace' | 'add' | 'family', familyName?: string) => {
    try {
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid JSON format: expected array of modes');
      }

      // Validate that all items have required properties
      for (const mode of jsonData) {
        if (!mode.slug || !mode.name || !mode.description || !mode.usage || !mode.prompt) {
          throw new Error('Invalid mode format: missing required properties');
        }
      }

      let newModes: Mode[];
      let renamedModes: { original: string, new: string }[] = [];

      switch (strategy) {
        case 'replace':
          newModes = jsonData;
          break;
        case 'add':
          // Resolve slug conflicts by renaming conflicting modes
          const { resolvedModes, renamedModes: conflictsResolved } = resolveSlugConflicts(jsonData, modes);
          newModes = [...modes, ...resolvedModes];
          renamedModes = conflictsResolved;
          break;
        case 'family':
          // For family import, create new family and assign modes to it
          if (familyName) {
            // Create slug from family name (lowercase, replace spaces with hyphens)
            const familyId = familyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            // Create new family if it doesn't exist
            const existingFamily = families.find(f => f.id === familyId);
            if (!existingFamily) {
              const newFamily: ModeFamily = {
                id: familyId,
                name: familyName,
                description: `Imported family: ${familyName}`,
                color: '#3B82F6' // Default blue color
              };
              addFamily(newFamily);
            }

            // Resolve slug conflicts within family import as well
            const modesWithFamily = jsonData.map(mode => ({
              ...mode,
              family: familyId
            }));
            const { resolvedModes: resolvedFamilyModes, renamedModes: familyConflictsResolved } = resolveSlugConflicts(modesWithFamily, modes);
            newModes = [...modes, ...resolvedFamilyModes];
            renamedModes = familyConflictsResolved;
          } else {
            // Fallback: just add without family assignment (with conflict resolution)
            const { resolvedModes, renamedModes: fallbackConflictsResolved } = resolveSlugConflicts(jsonData, modes);
            newModes = [...modes, ...resolvedModes];
            renamedModes = fallbackConflictsResolved;
          }
          break;
        default:
          throw new Error('Invalid import strategy');
      }

      setModes(newModes);
      return { success: true, renamedModes };
    } catch (error) {
      console.error('Failed to import modes from JSON:', error);
      return { success: false, renamedModes: [] };
    }
  };

  /**
   * Reset modes to initial default state
   */
  const resetModes = () => {
    try {
      // Reset modes to initial data from JSON file
      setModes(modesData);

      // Reset families to default + standalone
      setFamilies([defaultFamilyData, standaloneFamilyData]);

      // Reset selected families to ['default', 'standalone']
      setSelectedFamilies(['default', 'standalone']);

      // Reset global config to empty
      setGlobalConfig({ forAllModes: '' });

      // Clear localStorage
      localStorage.removeItem(MODES_STORAGE_KEY);
      localStorage.removeItem(FAMILIES_STORAGE_KEY);
      localStorage.removeItem(SELECTED_FAMILIES_STORAGE_KEY);
      localStorage.removeItem(GLOBAL_MODES_CONFIG_KEY);

      return true;
    } catch (error) {
      console.error('Failed to reset modes:', error);
      return false;
    }
  };

  /**
   * Load modes and families from localStorage
   */
  const loadFromLocalStorage = () => {
    try {
      const savedModes = localStorage.getItem(MODES_STORAGE_KEY);
      if (savedModes) {
        const parsedModes = JSON.parse(savedModes);
        setModes(parsedModes);
      }

      const savedFamilies = localStorage.getItem(FAMILIES_STORAGE_KEY);
      if (savedFamilies) {
        const parsedFamilies = JSON.parse(savedFamilies);
        // Ensure default and standalone families are always present
        const hasDefaultFamily = parsedFamilies.some((f: ModeFamily) => f.id === 'default');
        const hasStandaloneFamily = parsedFamilies.some((f: ModeFamily) => f.id === 'standalone');
        let familiesWithRequired = parsedFamilies;
        if (!hasDefaultFamily) {
          familiesWithRequired = [defaultFamilyData, ...familiesWithRequired];
        }
        if (!hasStandaloneFamily) {
          familiesWithRequired = [...familiesWithRequired, standaloneFamilyData];
        }
        setFamilies(familiesWithRequired);
      }

      const savedSelectedFamilies = localStorage.getItem(SELECTED_FAMILIES_STORAGE_KEY);
      if (savedSelectedFamilies) {
        const parsedSelected = JSON.parse(savedSelectedFamilies);
        setSelectedFamilies(parsedSelected);
      }

      const savedGlobalConfig = localStorage.getItem(GLOBAL_MODES_CONFIG_KEY);
      if (savedGlobalConfig) {
        const parsedGlobalConfig = JSON.parse(savedGlobalConfig);
        setGlobalConfig(parsedGlobalConfig);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Auto-save to localStorage whenever modes, families, or selected families change
  useEffect(() => {
    saveToLocalStorage();
  }, [modes, families, selectedFamilies]);

  const contextValue: ModeContextType = {
    modes,
    families,
    selectedFamilies,
    updateMode,
    addMode,
    deleteMode,
    addFamily,
    updateFamily,
    deleteFamily,
    setSelectedFamilies,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportModesToJson,
    exportSelectedModes,
    importModesFromJson,
    importFromFile,
    exportFamilyToJson,
    importFamilyFromJson,
    resetModes,
    globalConfig,
    updateGlobalConfig,
  };

  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  );
};

/**
 * Hook to use the mode context
 */
export const useModes = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useModes must be used within a ModeProvider');
  }
  return context;
};