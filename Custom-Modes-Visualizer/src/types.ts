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
 * Export/import format for modes (used in YAML/JSON files)
 */
export type ExportMode = {
  /** Unique identifier for the mode */
  slug: string;
  /** Display name of the mode */
  name: string;
  /** Brief description of the mode's purpose */
  description: string;
  /** The prompt text (maps to roleDefinition in export) */
  roleDefinition: string;
  /** When to use this mode (maps to whenToUse in export) */
  whenToUse: string;
  /** Groups this mode belongs to */
  groups: string[];
};

/**
 * Container format for exported modes
 */
export type ExportFormat = {
  /** Array of modes to export */
  customModes: ExportMode[];
};

/**
 * Supported export/import formats
 */
export type FormatType = 'json' | 'yaml';

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
   /** Array of modes in export format (for newer family files) */
   customModes?: ExportMode[];
};

/**
 * Available view types for the application
 */
export type ViewType = 'table' | 'smart' | 'prompt-builder';

/**
 * Represents a category for organizing features
 */
export type FeatureCategory = {
  /** Unique identifier for the category */
  id: string;
  /** Display name for the category */
  name: string;
  /** Brief description of what features in this category control */
  description: string;
};

/**
 * Represents a toggleable feature definition
 */
export type FeatureDefinition = {
  /** Unique identifier for the feature */
  id: string;
  /** Display name for the feature */
  name: string;
  /** Brief description of what this feature does */
  description: string;
  /** Category this feature belongs to */
  category: string;
  /** Default enabled state per mode (mode slug -> boolean) */
  defaultEnabled: Record<string, boolean>;
};

/**
 * State representing which features are enabled (feature id -> boolean)
 */
export type FeatureState = Record<string, boolean>;

/**
 * Represents a user-created custom feature
 */
export type CustomFeature = {
  /** Unique identifier for the custom feature */
  id: string;
  /** Display name for the feature */
  name: string;
  /** Brief description of what this feature does */
  description: string;
  /** Category this feature belongs to */
  category: string;
};

/**
 * Ordering of features for drag-and-drop functionality (array of feature ids)
 */
export type FeatureOrder = string[];

/**
 * Extended feature state including built-in features, custom features, and ordering
 */
export type ExtendedFeatureState = {
  /** Built-in features state */
  builtin: FeatureState;
  /** Custom features state (feature id -> boolean) */
  custom: Record<string, boolean>;
  /** Order of features for drag-and-drop */
  order: FeatureOrder;
};

/**
 * Global configuration for all modes
 */
export interface GlobalConfig {
  /** Common instructions applied to all modes */
  forAllModes: string;
}

/**
 * Persistence format for custom features in localStorage
 */
export type PersistedCustomFeatures = {
  /** Array of custom features */
  features: CustomFeature[];
  /** Last modified timestamp */
  lastModified: string;
};

/**
 * State for the Prompt Builder component
 */
export interface PromptBuilderState {
  /** Currently selected base mode */
  selectedMode: Mode | null;
  /** Additional custom instructions */
  customPrompt: string;
  /** Generated prompt text */
  generatedPrompt: string;
  /** Selected features for this prompt */
  selectedFeatures: ExtendedFeatureState;
  /** Available custom features for selection */
  availableCustomFeatures: CustomFeature[];
}

/**
 * State management interface for mode data
 */
export interface ModeContextType {
  modes: Mode[];
  families: ModeFamily[];
  selectedFamilies: string[];
  customFeatures: CustomFeature[];
  updateMode: (slug: string, updates: Partial<Mode>) => void;
  addMode: (mode: Mode) => void;
  deleteMode: (slug: string) => void;
  addFamily: (family: ModeFamily) => void;
  updateFamily: (id: string, updates: Partial<ModeFamily>) => void;
  deleteFamily: (id: string) => void;
  setSelectedFamilies: (familyIds: string[]) => void;
  addCustomFeature: (feature: CustomFeature) => void;
  updateCustomFeature: (id: string, updates: Partial<CustomFeature>) => void;
  deleteCustomFeature: (id: string) => void;
  reorderCustomFeatures: (newOrder: CustomFeature[]) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportModesToJson: () => boolean;
  exportSelectedModes: (format: FormatType, selectedSlugs: string[]) => boolean;
  importModesFromJson: (jsonData: Mode[], strategy: 'replace' | 'add' | 'family', familyName?: string) => { success: boolean, renamedModes: { original: string, new: string }[] };
  importFromFile: (file: File, strategy?: 'replace' | 'add' | 'family', familyName?: string) => Promise<{ success: boolean, renamedModes: { original: string, new: string }[] }>;
  exportFamilyToJson: (familyId: string) => boolean;
  importFamilyFromJson: (jsonData: ModeFamily, modes: Mode[], newFamilyName?: string) => boolean;
  resetModes: () => boolean;
  globalConfig: GlobalConfig;
  updateGlobalConfig: (updates: Partial<GlobalConfig>) => void;
}