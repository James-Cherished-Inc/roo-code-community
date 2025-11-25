# Interface-First Development Process

**Changelog**  
**Last changed:** 25-11-2025 13:14 - Created comprehensive source-of-truth doc for Interface-First workflow, integrating new audit utility implementation details, usage, obstacles, and improvements. Links: [`docs/Changelog/Code/25-11-2025-Interface-Audit-Utility-Implementation.md`](docs/Changelog/Code/25-11-2025-Interface-Audit-Utility-Implementation.md), [`docs/Master-Implementation-Plan.md#interface-parsing`](docs/Master-Implementation-Plan.md).

## Table of Contents
- [Purpose](#purpose)
- [Prerequisites](#prerequisites)
- [Process Overview](#process-overview)
- [Step-by-Step Workflow](#step-by-step-workflow)
- [Usage Example](#usage-example)
- [Implementation Changes](#implementation-changes)
- [Obstacles Overcome](#obstacles-overcome)
- [Future Improvements](#future-improvements)

## Purpose
Defines the standardized Interface-First Development Process using the new audit utility to safely evolve TypeScript interfaces before code changes, ensuring type safety and minimizing breaking changes. *Last updated: 25-11-2025 13:14*

## Prerequisites
- Roo Modes Visualizer codebase with audit utility: Import from [`src/utils/interfaceAudit.ts`](src/utils/interfaceAudit.ts)
- TypeScript environment (browser/Node.js; simulates fs in browser via mocks)
- Familiarity with interfaces like [`ModeContextType`](src/types.ts:176)

**Success Signal**: `generateAuditReport()` returns [`FunctionExtensionChecklist`](src/types.ts:208) with `breakingChanges: false` and complete `typeSafetyCoverage`.

## Process Overview
1. **Audit existing interface** before extensions (discover usages, dependencies, risks)
2. **Validate proposed changes** (check breaking risks, duplicates)
3. **Review checklist** (`FunctionExtensionChecklist` / [`InterfaceAuditResult`](src/types.ts:219))
4. **Implement safely** (make new params optional, migrate usages)
5. **Re-audit** post-changes

Enables "design before code" with automated risk assessment. Grounded in regex parsing of TS files (MVP: no AST deps). See [`src/utils/interfaceAudit.ts`](src/utils/interfaceAudit.ts).

## Step-by-Step Workflow
1. **Scan codebase**: `scanInterfaces()` → Discovers all interfaces/types (e.g., `ModeContextType` in [`src/types.ts`](src/types.ts:176))
2. **Analyze deps**: `analyzeDependencies('ModeContextType')` → Lists usages, risk level, affected files
3. **Check breaks**: `checkBreakingChanges('ModeContextType', ['newParam?: string'])` → Assesses impact, suggests migrations
4. **Generate report**: `generateAuditReport('ModeContextType')` → Populates checklist for review
5. **Validate**: `validateInterfaceChanges('ModeContextType', proposedProps)` → Catches issues pre-commit
6. **Full audit**: `performFullAudit()` → Scans entire codebase for risks

> **Warning**: Browser sim uses mocks; Node/Vite plugin for prod fs access.

## Usage Example
```typescript
import { generateAuditReport } from './utils/interfaceAudit';

const audit = generateAuditReport('ModeContextType');
console.log(audit); 
// {
//   existingInterfaces: ['ModeContextType', 'Mode', 'ModeFamily'],
//   affectedComponents: ['src/context/ModeContext.tsx', 'src/components/PromptBuilder.tsx'],
//   breakingChanges: false,
//   backwardCompatibility: true,
//   typeSafetyCoverage: ['ModeContextType']
// }
```
*Last updated: 25-11-2025 13:14*

## Implementation Changes
- Added [`FunctionExtensionChecklist`](src/types.ts:208) interface and [`InterfaceAuditResult`](src/types.ts:219) type in [`src/types.ts`](src/types.ts)
- Created [`src/utils/interfaceAudit.ts`](src/utils/interfaceAudit.ts): `scanInterfaces()` (l94), `analyzeDependencies()` (l283), `checkBreakingChanges()` (l355), `generateAuditReport()` (l451)
- Updated [`docs/Changelog/Code/25-11-2025-Interface-Audit-Utility-Implementation.md`](docs/Changelog/Code/25-11-2025-Interface-Audit-Utility-Implementation.md)
- Integrated in [`docs/Master-Implementation-Plan.md`](docs/Master-Implementation-Plan.md) Phase 4
*Last updated: 25-11-2025 13:14*

## Obstacles Overcome
- **TS mismatches** (e.g., `ModeContextType` + `importFromFile/customSuffix`): 30+ min debug; avoided via pre-extension audits.
- **Regex limits** for complex TS: MVP efficient; future: ts-morph AST.
*Last updated: 25-11-2025 13:14*

## Future Improvements
- Integrate `generateAuditReport` into pre-commit hook (husky + lint-staged)
- VSCode extension: On-save checklist generation
- Enhance with ts-morph AST parsing (100% accuracy, real fs)
*Last updated: 25-11-2025 13:14*

**Document Health**: Aligned with code; no inconsistencies found. **Overall Docs Status**: Healthy, up-to-date.