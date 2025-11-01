---
title: Testing Documentation for exportSelectedModes Function
last_updated: 2025-11-01T22:03:00Z
changelog:
  - date: 2025-11-01T22:03:00Z
    author: Technical Writer
    changes: "Created comprehensive testing documentation for exportSelectedModes function based on test analysis and code review."
---

# Testing Documentation for exportSelectedModes Function

This document provides a detailed reference for understanding the testing approach, setup, and coverage for the `exportSelectedModes` function. It serves as a guide for developers to understand what is tested, how tests are structured, and how to add new tests.

## Table of Contents

- [Overview](#overview)
- [Test Setup and Environment](#test-setup-and-environment)
- [Test Scenarios Coverage](#test-scenarios-coverage)
- [Test Structure and Approach](#test-structure-and-approach)
- [Guidelines for Adding Future Tests](#guidelines-for-adding-future-tests)
- [Running the Tests](#running-the-tests)

## Overview

The `exportSelectedModes` function handles exporting selected AI assistant modes to JSON or YAML format with proper filename generation and MIME types. The tests ensure this functionality works correctly across various scenarios.

**Function Location**: [`src/context/ModeContext.tsx`](src/context/ModeContext.tsx:238-270)  
**Test File**: [`src/test/exportSelectedModes.test.ts`](src/test/exportSelectedModes.test.ts)  
**Test Framework**: Vitest with jsdom  
**Coverage**: 9 test cases covering all specified scenarios

## Test Setup and Environment

### Prerequisites

- Node.js environment with npm
- Project dependencies installed via `npm install`

### Testing Framework Configuration

The tests use Vitest with jsdom for DOM simulation. Key setup details:

- **Framework**: Vitest v3.2.4
- **DOM Environment**: jsdom v27.0.1
- **Test Utilities**: @testing-library/jest-dom v6.9.1
- **Setup File**: [`src/test/setup.ts`](src/test/setup.ts) (imports jest-dom for extended matchers)

### Mock Strategy

The tests mock external dependencies to isolate the function under test:

- `serializeExportFormat`: Returns `'mocked-content'` for predictable serialization results
- `downloadFile`: Tracks calls without actual file operations
- `modeToExportMode`: Mocked to transform mode objects to export format

### Test Data

Tests use realistic mock mode data representing different families:

```typescript
const mockModes = [
  { slug: 'debug-mode', name: 'Debug Mode', family: 'default' },
  { slug: 'code-mode', name: 'Code Mode', family: 'standalone' },
  { slug: 'architect-mode', name: 'Architect Mode', family: 'cherished' }
]
```

## Test Scenarios Coverage

The test suite covers 9 scenarios to ensure comprehensive functionality:

### Core Functionality Tests

1. **No Modes Selected**: Verifies `exportSelectedModes` returns `false` when no modes are selected, preventing empty exports.

2. **Single Family Filename**: Tests filename generation for modes from one family (e.g., `roo-modes-default.json`).

3. **Multiple Families Filename**: Ensures family names are sorted alphabetically and joined with hyphens (e.g., `roo-modes-cherished-default-standalone.json`).

4. **Edge Case - No Families**: Handles modes without family assignments, resulting in `roo-modes-.json`.

### Format and MIME Type Tests

5. **Alphabetical Family Sorting**: Confirms family names in filenames are consistently sorted (cherished-default-standalone).

6. **JSON Format Support**: Validates correct MIME type (`application/json`) and extension (`.json`).

7. **YAML Format Support**: Validates correct MIME type (`application/x-yaml`) and extension (`.yaml`).

### Data Integrity Tests

8. **Data Serialization**: Ensures `serializeExportFormat` receives correctly transformed mode data with required fields (slug, name, description, roleDefinition, whenToUse, groups).

9. **Same Family Handling**: Tests filename generation when multiple modes belong to the same family.

## Test Structure and Approach

### Test Organization

The test file uses Vitest's `describe` and `it` blocks for clear organization:

```typescript
describe('exportSelectedModes', () => {
  // Setup and helper functions
  // Individual test cases
})
```

### Testing Strategy

- **Isolation**: Each test is independent with `beforeEach` clearing mocks
- **Mock Verification**: Tests verify correct function calls and parameters
- **Behavior Validation**: Asserts expected return values and side effects
- **Edge Case Coverage**: Includes boundary conditions and error scenarios

### Helper Function

A `createExportSelectedModes` function recreates the export logic for testability, avoiding React context dependencies:

```typescript
const createExportSelectedModes = (modes: Mode[]) => {
  return (format: FormatType, selectedSlugs: string[]): boolean => {
    // Inlined export logic for testing
  }
}
```

This approach allows testing the core logic without mounting React components.

## Guidelines for Adding Future Tests

### When to Add Tests

Add new tests when:
- Modifying export logic (filename generation, data transformation)
- Adding new export formats
- Changing error handling behavior
- Updating mode data structure

### Test Naming Convention

Use descriptive names following the pattern: "should [expected behavior] when [condition]"

```typescript
it('should generate correct filename for single family', () => {
  // Test implementation
})
```

### Test Structure Guidelines

1. **Arrange**: Set up test data and mocks
2. **Act**: Call the function under test
3. **Assert**: Verify expected behavior through return values and mock calls

### Mocking Best Practices

- Mock external dependencies (file operations, serialization)
- Use realistic mock data that matches production structure
- Verify mock interactions to ensure correct function usage
- Clear mocks between tests to prevent interference

### Coverage Goals

Aim for high coverage of:
- Happy path scenarios
- Edge cases (empty inputs, boundary conditions)
- Error conditions and error handling
- Different data formats and configurations

### Test Data Management

- Use consistent mock data across related tests
- Include diverse scenarios (different families, formats, mode counts)
- Keep test data minimal but representative

## Running the Tests

### Local Development

**Task**: Run tests in watch mode during development  
**Prerequisites**: Project dependencies installed  
**Steps**:
1. Open terminal in project root
2. Run `npm run test`
3. Tests execute automatically on file changes

**Success Signal**: All tests pass with green checkmarks

### CI/CD Execution

**Task**: Run tests once for CI validation  
**Prerequisites**: Project dependencies installed  
**Steps**:
1. Open terminal in project root
2. Run `npm run test:run`

**Success Signal**: Command exits with code 0, all tests reported as passed

### Debugging Failed Tests

If tests fail:
1. Check error messages for specific failures
2. Verify mock expectations match actual calls
3. Ensure test data matches function requirements
4. Run individual test files: `npx vitest src/test/exportSelectedModes.test.ts`