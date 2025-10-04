// TypeScript interfaces for the Roo Modes Visualizer application

/**
 * Represents a single mode definition in the Roo system
 */
export type Mode = {
  /** Unique identifier for the mode (used in routing and keys) */
  slug: string;
  /** Display name with emoji icon */
  name: string;
  /** Brief description of the mode's purpose */
  description: string;
  /** How and when to use this mode */
  usage: string;
  /** The prompt text that defines the mode's behavior */
  prompt: string;
};

/**
 * Available view types for the application
 */
export type ViewType = 'table' | 'smart' | 'prompt-builder';

/**
 * State management interface for mode data
 */
export interface ModeContextType {
  modes: Mode[];
  updateMode: (slug: string, updates: Partial<Mode>) => void;
  addMode: (mode: Mode) => void;
  deleteMode: (slug: string) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportModesToJson: () => boolean;
  importModesFromJson: (jsonData: Mode[], strategy: 'replace' | 'add' | 'family') => boolean;
}