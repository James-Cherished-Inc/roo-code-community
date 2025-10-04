import type { Mode, ExportMode, ExportFormat, FormatType } from '../types';
import * as yaml from 'js-yaml';

// Fixed groups array as specified in requirements
const DEFAULT_GROUPS = ["read", "edit", "browser", "command", "mcp"];

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
export function exportModeToMode(exportMode: ExportMode): Mode {
  return {
    slug: exportMode.slug,
    name: exportMode.name,
    description: exportMode.description,
    usage: exportMode.whenToUse,     // whenToUse → usage
    prompt: exportMode.roleDefinition, // roleDefinition → prompt
    family: "standalone"             // Default family for imports
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