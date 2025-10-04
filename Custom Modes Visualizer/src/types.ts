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
  /** Family identifier this mode belongs to */
  family?: string;
};

/**
 * Represents a family of modes for organization
 */
export type ModeFamily = {
  /** Unique identifier for the family */
  id: string;
  /** Display name for the family */
  name: string;
  /** Brief description of the family */
  description: string;
  /** Color theme for the family (hex color) */
  color?: string;
  /** Whether this is a built-in default family */
  isDefault?: boolean;
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
  families: ModeFamily[];
  selectedFamilies: string[];
  updateMode: (slug: string, updates: Partial<Mode>) => void;
  addMode: (mode: Mode) => void;
  deleteMode: (slug: string) => void;
  addFamily: (family: ModeFamily) => void;
  updateFamily: (id: string, updates: Partial<ModeFamily>) => void;
  deleteFamily: (id: string) => void;
  setSelectedFamilies: (familyIds: string[]) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportModesToJson: () => boolean;
  importModesFromJson: (jsonData: Mode[], strategy: 'replace' | 'add' | 'family') => boolean;
  exportFamilyToJson: (familyId: string) => boolean;
  importFamilyFromJson: (jsonData: ModeFamily, modes: Mode[]) => boolean;
}