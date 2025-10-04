import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Mode, ModeContextType } from '../types';

// Load initial data from JSON file
import modesData from '../data/modes.json';

// Local storage key
const MODES_STORAGE_KEY = 'roo-modes-visualizer-modes';

/**
 * Context for managing mode data throughout the application
 */
const ModeContext = createContext<ModeContextType | undefined>(undefined);

/**
 * Provider component that manages the mode state
 */
export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with data from JSON file
  const [modes, setModes] = useState<Mode[]>(modesData);

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
   * Save current modes to localStorage
   */
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(MODES_STORAGE_KEY, JSON.stringify(modes));
    } catch (error) {
      console.error('Failed to save modes to localStorage:', error);
    }
  };

  /**
   * Load modes from localStorage
   */
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(MODES_STORAGE_KEY);
      if (saved) {
        const parsedModes = JSON.parse(saved);
        setModes(parsedModes);
      }
    } catch (error) {
      console.error('Failed to load modes from localStorage:', error);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Auto-save to localStorage whenever modes change
  useEffect(() => {
    saveToLocalStorage();
  }, [modes]);

  const contextValue: ModeContextType = {
    modes,
    updateMode,
    addMode,
    deleteMode,
    saveToLocalStorage,
    loadFromLocalStorage,
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