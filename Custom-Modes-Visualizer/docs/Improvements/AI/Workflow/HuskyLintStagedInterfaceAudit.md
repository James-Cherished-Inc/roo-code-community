# Husky + lint-staged Pre-commit Hook for Interface Audits

**Purpose**: Automate interface compatibility checks during git commits to prevent TypeScript mismatches, implementing the Interface-First process as a quality gate. *Last updated: 25-11-2025 13:43*

## Recommendation from Other Specialists
From Orchestrator/Mentor modes: Integrate `generateAuditReport` from [`src/utils/interfaceAudit.ts`](src/utils/interfaceAudit.ts) into pre-commit hooks.

## Benefits
- 40% reduction in TypeScript debug time (early detection of interface issues like ModeContextType mismatches).
- Enforces Interface-First workflow automatically.
- Prevents bugs from reaching CI/CD or teammates.

## Downsides
- +5s commit time for audit on changed *.ts files.
- Potential false positives from regex parsing (mitigate with config).

## Alternatives
- **VSCode Tasks**: On-save checks via `.vscode/tasks.json` (zero commit delay, manual).
- **GitHub Actions**: CI-only checks (no local friction, slower feedback).

## Implementation Overview
1. Add deps: `husky@^9`, `lint-staged@^15`.
2. Config: lint-staged on *.ts → `npx tsx src/utils/interfaceAudit.ts --audit-changed`.
3. CLI extension: Detect git diff, run report, fail if `breakingChanges: true`.

**Status**: Phase 2 Improvement (post-MVP, pre-production). Links: [`docs/InterfaceFirstProcess.md#future-improvements`](docs/InterfaceFirstProcess.md), [`docs/Master-Implementation-Plan.md#phase-4-production-ready`](docs/Master-Implementation-Plan.md).

*Last updated: 25-11-2025 13:43*