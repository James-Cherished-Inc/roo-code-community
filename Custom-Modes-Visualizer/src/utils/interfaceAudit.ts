/**
 * Interface Audit Utility
 * Automated scanning for interface dependencies and compatibility checks
 * @fileoverview Implements interface discovery, dependency analysis, and breaking change detection
 */

import type { InterfaceAuditResult } from '../types';

// File paths to scan (simulate comprehensive scanning without Node.js fs module)
const DEFAULT_SCAN_PATHS = [
  'src/components',
  'src/context',
  'src/utils',
  'src/types.ts',
  'src/App.tsx',
  'src/main.tsx'
];

// Regex patterns for interface detection and analysis
const INTERFACE_DECLARATION_REGEX = /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)\s*{/g;
const TYPE_ALIAS_REGEX = /\btype\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/g;

/**
 * Represents a discovered interface definition
 */
export interface DiscoveredInterface {
  name: string;
  file: string;
  lineNumber: number;
  type: 'interface' | 'type';
  properties: string[];
  isExported: boolean;
  dependsOn: string[];
  content: string;
}

/**
 * Represents an interface usage location
 */
export interface InterfaceUsage {
  file: string;
  lineNumber: number;
  context: string;
  usageType: 'type-annotation' | 'extends' | 'implements' | 'import' | 'generic' | 'destructuring';
}

/**
 * Result of interface scanning operation
 */
export interface ScanResult {
  interfaces: DiscoveredInterface[];
  totalFiles: number;
  scannedFiles: number;
  errors: string[];
  warnings: string[];
  scanTime: number;
}

/**
 * Result of dependency analysis
 */
export interface DependencyAnalysis {
  interface: string;
  directDependencies: InterfaceUsage[];
  transitiveDependencies: string[];
  impactedComponents: string[];
  riskLevel: 'low' | 'medium' | 'high';
  affectedFiles: string[];
  breakingChangeRisk: boolean;
}

/**
 * Result of breaking change analysis
 */
export interface BreakingChangeAnalysis {
  interface: string;
  newParameters: string[];
  impactAnalysis: {
    optionalBreakingChanges: boolean;
    requiredBreakingChanges: boolean;
    typeChanges: boolean;
    structuralChanges: boolean;
  };
  affectedLocations: InterfaceUsage[];
  migrationStrategies: string[];
  riskAssessment: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
  breakingChangeRisk: boolean;
}

/**
 * Core interface scanning function
 * Discovers all interfaces and type aliases in specified files
 */
export function scanInterfaces(filePaths?: string[]): ScanResult {
  const startTime = Date.now();
  const paths = filePaths || DEFAULT_SCAN_PATHS;
  const interfaces: DiscoveredInterface[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Simulate file scanning since we're in a browser environment
  // In a real development environment, this would use Node.js fs module
  const scanResults = simulateFileScanning(paths);
  
  scanResults.forEach(({ file, content }) => {
    try {
      const fileInterfaces = parseInterfacesFromFile(content, file);
      interfaces.push(...fileInterfaces);
    } catch (error) {
      errors.push(`Failed to parse ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const scanTime = Date.now() - startTime;

  return {
    interfaces,
    totalFiles: paths.length,
    scannedFiles: scanResults.length,
    errors,
    warnings,
    scanTime
  };
}

/**
 * Parse interfaces from a single file's content
 */
function parseInterfacesFromFile(content: string, file: string): DiscoveredInterface[] {
  const interfaces: DiscoveredInterface[] = [];
  const lines = content.split('\n');

  // Track interface properties and dependencies
  let currentInterface: DiscoveredInterface | null = null;
  let braceDepth = 0;
  let inInterface = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    // Check for interface declarations
    if (INTERFACE_DECLARATION_REGEX.test(line)) {
      const match = line.match(/\binterface\s+([A-Za-z_][A-Za-z0-9_]*)/);
      if (match) {
        currentInterface = {
          name: match[1],
          file,
          lineNumber,
          type: 'interface',
          properties: [],
          isExported: /export\s+interface/.test(line),
          dependsOn: [],
          content: line
        };
        inInterface = true;
        braceDepth = (line.match(/{/g) || []).length;
      }
    }

    // Check for type aliases
    if (TYPE_ALIAS_REGEX.test(line) && !inInterface) {
      const match = line.match(/\btype\s+([A-Za-z_][A-Za-z0-9_]*)/);
      if (match) {
        currentInterface = {
          name: match[1],
          file,
          lineNumber,
          type: 'type',
          properties: [],
          isExported: /export\s+type/.test(line),
          dependsOn: extractTypeDependencies(line),
          content: line
        };
        interfaces.push(currentInterface);
      }
    }

    // Track interface properties
    if (currentInterface && inInterface) {
      if (trimmedLine.includes('{')) braceDepth++;
      if (trimmedLine.includes('}')) braceDepth--;

      // Extract property names (simple property detection)
      if (trimmedLine.includes(':') && !trimmedLine.includes('//')) {
        const propertyMatch = trimmedLine.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/);
        if (propertyMatch && braceDepth > 0) {
          currentInterface.properties.push(propertyMatch[1]);
          currentInterface.content += `\n${line}`;
        }
      }

      // Extract dependencies from property types
      const typeMatch = trimmedLine.match(/:\s*([^;,]+)/);
      if (typeMatch && braceDepth > 0) {
        currentInterface.dependsOn.push(...extractTypeDependencies(typeMatch[1]));
      }

      // End of interface
      if (braceDepth === 0 && inInterface) {
        interfaces.push(currentInterface);
        currentInterface = null;
        inInterface = false;
      }
    }
  });

  return interfaces;
}

/**
 * Extract type dependencies from a type expression
 */
function extractTypeDependencies(typeExpr: string): string[] {
  const dependencies: string[] = [];
  
  // Find interface/type references in union types, intersection types, etc.
  const typeRefMatches = typeExpr.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  typeRefMatches.forEach(typeRef => {
    // Filter out built-in types
    if (!['string', 'number', 'boolean', 'void', 'null', 'undefined', 'any', 'unknown', 'never', 'object'].includes(typeRef)) {
      dependencies.push(typeRef);
    }
  });

  return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Simulate file scanning in browser environment
 * In a real development tool, this would use actual file system access
 */
function simulateFileScanning(filePaths: string[]): Array<{ file: string; content: string }> {
  // This is a simplified simulation
  // In practice, this would integrate with tools like TypeScript's language service or use a bundler's file system
  const mockFileMap: Record<string, string> = {
    'src/types.ts': `export interface Mode {
  slug: string;
  name: string;
  description: string;
  usage: string;
  prompt: string;
  family?: string;
}

export interface ModeContextType {
  modes: Mode[];
  families: ModeFamily[];
  updateMode: (slug: string, updates: Partial<Mode>) => void;
  exportSelectedModes: (format: FormatType, selectedSlugs: string[]) => boolean;
}`,
    'src/context/ModeContext.tsx': `import type { Mode, ModeContextType } from '../types';

const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const contextValue: ModeContextType = {
    modes: [],
    families: [],
    updateMode: (slug: string, updates: Partial<Mode>) => {},
    exportSelectedModes: () => true
  };
}`,
    'src/components/PromptBuilder.tsx': `import type { Mode, ModeContextType } from '../types';

interface PromptBuilderProps {
  selectedMode?: Mode;
  onModeChange: (mode: Mode) => void;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ selectedMode, onModeChange }) => {
  const { modes, updateMode } = useContext(ModeContext);
};`
  };

  return filePaths.map(path => ({
    file: path,
    content: mockFileMap[path] || `// Simulated content for ${path}`
  }));
}

/**
 * Analyze dependencies for a specific interface
 */
export function analyzeDependencies(interfaceName: string): DependencyAnalysis {
  const scanResult = scanInterfaces();
  const targetInterface = scanResult.interfaces.find(intf => intf.name === interfaceName);
  
  if (!targetInterface) {
    return {
      interface: interfaceName,
      directDependencies: [],
      transitiveDependencies: [],
      impactedComponents: [],
      riskLevel: 'low',
      affectedFiles: [],
      breakingChangeRisk: false
    };
  }

  const dependencies: InterfaceUsage[] = [];
  const affectedFiles: string[] = [];

  // Scan for interface usage across all interfaces
  scanResult.interfaces.forEach(intf => {
    if (intf.dependsOn.includes(interfaceName)) {
      dependencies.push({
        file: intf.file,
        lineNumber: intf.lineNumber,
        context: `${intf.type} ${intf.name}`,
        usageType: 'extends'
      });
      if (!affectedFiles.includes(intf.file)) {
        affectedFiles.push(intf.file);
      }
    }
  });

  // Check for direct usage in components
  affectedFiles.forEach(file => {
    const usages = findInterfaceUsagesInFile(file, interfaceName);
    dependencies.push(...usages);
  });

  const riskLevel = dependencies.length > 5 ? 'high' : 
                   dependencies.length > 2 ? 'medium' : 'low';
  
  const breakingChangeRisk = targetInterface.isExported && dependencies.length > 0;

  return {
    interface: interfaceName,
    directDependencies: dependencies,
    transitiveDependencies: targetInterface.dependsOn,
    impactedComponents: affectedFiles,
    riskLevel,
    affectedFiles,
    breakingChangeRisk
  };
}

/**
 * Find specific interface usages within a file
 */
function findInterfaceUsagesInFile(file: string, interfaceName: string): InterfaceUsage[] {
  // Simplified simulation - in reality would parse actual file content
  return [{
    file,
    lineNumber: 1,
    context: `Type reference to ${interfaceName}`,
    usageType: 'type-annotation'
  }];
}

/**
 * Check breaking changes for adding new parameters to an interface
 */
export function checkBreakingChanges(interfaceName: string, newParams: string[]): BreakingChangeAnalysis {
  const scanResult = scanInterfaces();
  const targetInterface = scanResult.interfaces.find(intf => intf.name === interfaceName);
  
  if (!targetInterface) {
    return {
      interface: interfaceName,
      newParameters: newParams,
      impactAnalysis: {
        optionalBreakingChanges: false,
        requiredBreakingChanges: false,
        typeChanges: false,
        structuralChanges: false
      },
      affectedLocations: [],
      migrationStrategies: ['Interface does not exist'],
      riskAssessment: 'critical',
      breakingChangeRisk: false
    };
  }

  const affectedLocations = findInterfaceUsagesInAllFiles(interfaceName);
  const isOptionalAddition = newParams.every(param => !param.includes('?:'));
  const riskAssessment = assessBreakingChangeRisk(targetInterface, newParams, affectedLocations.length);

  const impactAnalysis = {
    optionalBreakingChanges: !isOptionalAddition,
    requiredBreakingChanges: newParams.some(param => !param.includes('?:')),
    typeChanges: newParams.some(param => param.includes('<')),
    structuralChanges: newParams.length > 0
  };

  const migrationStrategies = generateMigrationStrategies(newParams, riskAssessment);

  return {
    interface: interfaceName,
    newParameters: newParams,
    impactAnalysis,
    affectedLocations,
    migrationStrategies,
    riskAssessment,
    breakingChangeRisk: riskAssessment === 'high' || riskAssessment === 'critical'
  };
}

/**
 * Find all interface usages across all files
 */
function findInterfaceUsagesInAllFiles(interfaceName: string): InterfaceUsage[] {
  const dependencies = analyzeDependencies(interfaceName);
  return dependencies.directDependencies;
}

/**
 * Assess the risk level of breaking changes
 */
function assessBreakingChangeRisk(
  interfaceDef: DiscoveredInterface, 
  newParams: string[], 
  usageCount: number
): BreakingChangeAnalysis['riskAssessment'] {
  if (!interfaceDef.isExported) return 'minimal';
  if (usageCount === 0) return 'low';
  if (usageCount > 10 && newParams.some(p => !p.includes('?:'))) return 'critical';
  if (usageCount > 5) return 'high';
  if (usageCount > 2) return 'medium';
  return 'low';
}

/**
 * Generate migration strategies for new parameters
 */
function generateMigrationStrategies(
  newParams: string[], 
  riskLevel: BreakingChangeAnalysis['riskAssessment']
): string[] {
  const strategies: string[] = [];
  
  if (newParams.some(param => !param.includes('?:'))) {
    strategies.push('Make all new parameters optional to avoid breaking existing code');
  }
  
  strategies.push('Update all affected files with new parameter usage');
  strategies.push('Consider using interface extension instead of direct modification');
  
  if (riskLevel === 'high' || riskLevel === 'critical') {
    strategies.push('Implement gradual migration using interface versioning');
    strategies.push('Create compatibility shims for legacy usage');
  }

  return strategies;
}

/**
 * Generate comprehensive audit report
 */
export function generateAuditReport(interfaceName: string): InterfaceAuditResult {
  const dependencies = analyzeDependencies(interfaceName);
  const breakingChanges = checkBreakingChanges(interfaceName, []);

  const report: InterfaceAuditResult = {
    existingInterfaces: [interfaceName, ...dependencies.transitiveDependencies],
    affectedComponents: dependencies.affectedFiles,
    breakingChanges: breakingChanges.impactAnalysis.requiredBreakingChanges,
    backwardCompatibility: !breakingChanges.breakingChangeRisk,
    typeSafetyCoverage: [interfaceName]
  };

  return report;
}

/**
 * Perform comprehensive interface audit for all interfaces
 */
export function performFullAudit(): ScanResult & {
  totalInterfaces: number;
  criticalRisks: string[];
  recommendations: string[];
} {
  const scanResult = scanInterfaces();
  const criticalRisks: string[] = [];
  const recommendations: string[] = [];

  scanResult.interfaces.forEach(intf => {
    const analysis = analyzeDependencies(intf.name);
    if (analysis.riskLevel === 'high' && analysis.breakingChangeRisk) {
      criticalRisks.push(`${intf.name} in ${intf.file}`);
    }
  });

  if (criticalRisks.length > 0) {
    recommendations.push('Review critical interfaces before making changes');
    recommendations.push('Consider interface versioning for high-risk interfaces');
  }

  if (scanResult.interfaces.some(intf => intf.isExported && intf.properties.length > 10)) {
    recommendations.push('Consider breaking down large interfaces into smaller ones');
  }

  return {
    ...scanResult,
    totalInterfaces: scanResult.interfaces.length,
    criticalRisks,
    recommendations
  };
}

/**
 * Validate interface modifications
 */
export function validateInterfaceChanges(
  interfaceName: string, 
  proposedChanges: string[]
): { valid: boolean; issues: string[]; warnings: string[] } {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  const scanResult = scanInterfaces();
  const existingInterface = scanResult.interfaces.find(intf => intf.name === interfaceName);
  
  if (!existingInterface) {
    issues.push(`Interface '${interfaceName}' does not exist`);
    return { valid: false, issues, warnings };
  }

  // Check for breaking changes
  proposedChanges.forEach(change => {
    if (!change.includes('?:')) {
      warnings.push(`Required parameter addition may cause breaking changes: ${change}`);
    }
  });

  // Check for duplicate properties
  const existingProperties = new Set(existingInterface.properties);
  proposedChanges.forEach(change => {
    const propMatch = change.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/);
    if (propMatch && existingProperties.has(propMatch[1])) {
      issues.push(`Duplicate property: ${propMatch[1]}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
}

// Export utility functions for development workflow
export {
  DEFAULT_SCAN_PATHS,
  INTERFACE_DECLARATION_REGEX,
  TYPE_ALIAS_REGEX,
  parseInterfacesFromFile,
  extractTypeDependencies,
  findInterfaceUsagesInFile
};