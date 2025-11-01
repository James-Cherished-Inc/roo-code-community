import type { Mode, ExportMode, ExportFormat, FormatType } from '../types';
import * as yaml from 'js-yaml';

// Fixed groups array as specified in requirements
const DEFAULT_GROUPS = ["read", "edit", "browser", "command", "mcp"];

/**
 * Detects slug conflicts between existing and imported modes
 */
export function detectSlugConflicts(existingModes: Mode[], importedModes: Mode[]): Mode[] {
  const existingSlugs = new Set(existingModes.map(mode => mode.slug));
  return importedModes.filter(mode => existingSlugs.has(mode.slug));
}

/**
 * Generates a unique slug by adding an incremental suffix
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.has(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

/**
 * Resolves slug conflicts by renaming conflicting modes
 * Returns the resolved modes and information about renamed modes for user feedback
 */
export function resolveSlugConflicts(
  importedModes: Mode[],
  existingModes: Mode[]
): { resolvedModes: Mode[], renamedModes: { original: string, new: string }[] } {
  const existingSlugs = new Set(existingModes.map(mode => mode.slug));
  const resolvedModes = [...importedModes];
  const renamedModes: { original: string, new: string }[] = [];

  resolvedModes.forEach((mode, index) => {
    if (existingSlugs.has(mode.slug)) {
      const originalSlug = mode.slug;
      const newSlug = generateUniqueSlug(originalSlug, existingSlugs);

      // Update the mode with the new slug
      resolvedModes[index] = { ...mode, slug: newSlug };

      // Track the rename
      renamedModes.push({ original: originalSlug, new: newSlug });

      // Add the new slug to the set to avoid future conflicts
      existingSlugs.add(newSlug);
    }
  });

  return { resolvedModes, renamedModes };
}

/**
 * Converts a Mode to ExportMode format
 */
export function modeToExportMode(mode: Mode): ExportMode {
  return {
    slug: mode.slug,
    name: mode.name,
    description: mode.description,
    roleDefinition: mode.prompt, // prompt → roleDefinition
    whenToUse: mode.usage,       // usage → whenToUse
    groups: DEFAULT_GROUPS       // Fixed groups array
  };
}

/**
 * Converts an ExportMode to Mode format
 */
export function exportModeToMode(exportMode: ExportMode, family: string = "standalone"): Mode {
  return {
    slug: exportMode.slug,
    name: exportMode.name,
    description: exportMode.description,
    usage: exportMode.whenToUse,     // whenToUse → usage
    prompt: exportMode.roleDefinition, // roleDefinition → prompt
    family: family                   // Use provided family or default to standalone
  };
}

/**
 * Detects file format from filename
 */
export function detectFileFormat(filename: string): FormatType | null {
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith('.json')) {
    return 'json';
  } else if (lowerFilename.endsWith('.yaml') || lowerFilename.endsWith('.yml')) {
    return 'yaml';
  }
  return null;
}

/**
 * Parses file content based on format
 */
export function parseFileContent(text: string, format: FormatType): ExportFormat {
  try {
    if (format === 'json') {
      return JSON.parse(text) as ExportFormat;
    } else {
      return yaml.load(text, { schema: yaml.FAILSAFE_SCHEMA }) as ExportFormat;
    }
  } catch (error) {
    throw new Error(`Failed to parse ${format.toUpperCase()} content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Serializes ExportFormat to string based on format
 */
export function serializeExportFormat(data: ExportFormat, format: FormatType): string {
  try {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return yaml.dump(data, { indent: 2 });
    }
  } catch (error) {
    throw new Error(`Failed to serialize ${format.toUpperCase()} content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates ExportFormat structure
 */
export function validateExportFormat(data: any): data is ExportFormat {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!Array.isArray(data.customModes)) {
    return false;
  }

  // Validate each mode has required fields
  for (const mode of data.customModes) {
    if (!mode ||
        typeof mode.slug !== 'string' ||
        typeof mode.name !== 'string' ||
        typeof mode.description !== 'string' ||
        typeof mode.roleDefinition !== 'string' ||
        typeof mode.whenToUse !== 'string' ||
        !Array.isArray(mode.groups)) {
      return false;
    }
  }

  return true;
}

/**
 * Loads modes from a family file by converting export modes to internal modes
 */
export function loadModesFromFamily(family: any): Mode[] {
  // Handle backward compatibility - if family doesn't have customModes, return empty array
  if (!family.customModes || !Array.isArray(family.customModes)) {
    return [];
  }

  return family.customModes.map((exportMode: ExportMode) =>
    exportModeToMode(exportMode, family.id)
  );
}

/**
 * Downloads content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}