## [2025-11-23] - Family Mode Import Duplicate Handling Enhancement

### What's Changed
- **Flexible Duplicate Resolution**: Enhanced family mode imports with user-configurable duplicate handling options
- **Three Strategy Options**: Implemented three distinct strategies for managing duplicate mode slugs during batch imports:
  - Option 1: "Append -2 at the end" (automatic numbering like previous behavior)
  - Option 2: "Append the name of the file" (filename-based suffix generation)
  - Option 3: "Input custom suffix" (user-defined suffix applied to entire family)
- **Enhanced UI**: Added comprehensive duplicate handling UI section with visual examples
- **Type Safety**: Fixed TypeScript compilation errors and added missing interface definitions
- **Build Resolution**: Resolved all unused variable warnings and ensured clean compilation

### Why (ADR Links)
- [docs/Changelog/Decisions/Family-Mode-Import-Duplicate-Handling-ADR.md](docs/Changelog/Decisions/Family-Mode-Import-Duplicate-Handling-ADR.md) - Architecture decision for flexible suffix-based duplicate resolution
- User requested greater control over duplicate slug handling in family mode imports
- Enhanced user experience through intuitive radio button interface with visual examples
- Maintained full backward compatibility while adding requested functionality

### Issues Encountered
- **TypeScript Compilation Errors**: Function signature mismatches in ModeContextType interface
- **Build Warnings**: Functions and variables in ColoredPromptDisplay.tsx causing build failures
- **UI State Management**: Complex state coordination between import strategy and suffix options

### Why and How Solved
- **Interface Updates**: Added missing `importFromFile` signature and removed duplicate declarations in `src/types.ts`
- **Code Cleanup**: Removed unused code with proper underscore prefixing for intentional unused variables
- **Conditional Rendering**: Implemented conditional rendering based on import strategy selection

### Which Git Branch
master

### Impacted Files
- `src/utils/formatConversion.ts` - Enhanced `generateUniqueSlug` and `resolveSlugConflicts` functions
- `src/components/ImportModal.tsx` - Added comprehensive duplicate handling UI for family imports
- `src/context/ModeContext.tsx` - Modified import functions to accept optional custom suffix parameter
- `src/types.ts` - Added missing interface definitions and resolved TypeScript compilation errors
- `src/components/ColoredPromptDisplay.tsx` - Removed unused functions to fix compilation

### Further Actions
- Test coverage for new duplicate handling scenarios
- User preference persistence for default duplicate handling choice
- Batch import validation enhancements
- Import history tracking with rollback capabilities

---

## [2025-11-22] - Lego Blocks Show Actual Prompt Contributions

### What's Changed
- **Real Content Display**: Modified feature blocks to show actual prompt text format: `## Feature Name\nDescription`
- **Data Source Accuracy**: Eliminated text parsing in favor of direct access to `enabledFeatures` array data
- **Prompt Assembly Visualization**: Each block now displays the exact text contribution that gets concatenated into the final prompt
- **Test Updates**: Updated test suite to validate new content display behavior and fixed vitest imports

### Why (ADR Links)
- [docs/LegoPromptDisplay-Plan.md](docs/LegoPromptDisplay-Plan.md) - Enhanced visual breakdown showing how prompts are actually built, like Lego pieces assembling a structure
- Improved user understanding by displaying the real text components that form the complete prompt

### Issues Encountered
- **Test Compatibility**: Initial tests expected generic "Base Mode" labels but implementation shows actual content
- **Text Parsing Removal**: Removing regex parsing logic required careful validation that data flow remained intact
- **Vitest Imports**: Fixed test imports to use correct vitest function imports instead of jest globals

### Why and How Solved
- **Test Updates**: Modified test expectations to match actual content display (checking for `## Empathy & Friendly Tone Guidelines` instead of feature names)
- **Data Flow**: Replaced `extractFeatureContent()` parsing with direct `feature.name` and `feature.description` access
- **Import Fixes**: Corrected vitest imports using `import { describe, test, expect, vi } from 'vitest'` pattern

### Which Git Branch
visualizer-next

### Impacted Files
- `src/components/ColoredPromptDisplay.tsx` - Updated feature content generation to show actual prompt format
- `src/test/LegoPromptDisplay.test.tsx` - Fixed vitest imports and updated test expectations for actual content display

### Further Actions
- **Copy Functionality**: Consider implementing clipboard functionality for individual blocks or the complete assembled prompt
- **Content Truncation**: Add intelligent truncation for very long feature descriptions while maintaining readability
- **Performance Monitoring**: Monitor rendering performance with large feature sets

---

## [2025-11-22] - Enhanced Lego Display with Actual Prompt Content

### What's Changed
- **Actual Content Display**: Modified `ColoredPromptDisplay.tsx` to show actual prompt text contributions instead of summaries
- **Direct Data Access**: Replaced text parsing logic with direct access to source data for accurate content display
- **Base Mode Enhancement**: Added `baseModePrompt` prop to display actual base mode prompt text
- **Feature Content**: Updated feature block generation to use `feature.description` directly from features data
- **Custom Instructions**: Enhanced custom instruction extraction to prioritize actual custom text over parsing

### Why (ADR Links)
- [docs/LegoPromptDisplay-Plan.md](docs/LegoPromptDisplay-Plan.md) - Enhanced existing Lego-style architecture to show actual prompt composition rather than parsed summaries
- Improved user understanding by displaying real text contributions that build the final prompt

### Technical Implementation
- **Data Flow**: Modified component interface to accept actual source data (`baseModePrompt`) instead of parsing generated text
- **Feature Extraction**: Changed from regex parsing to direct `feature.description` access for accurate content display
- **PromptBuilder Integration**: Updated prop passing to include `baseModePrompt={selectedMode?.prompt || ''}`

### Which Git Branch
visualizer-next

### Impacted Files
- `src/components/ColoredPromptDisplay.tsx` - Enhanced to show actual prompt contributions with direct data access
- `src/components/PromptBuilder.tsx` - Updated to pass actual base mode prompt data via new prop

### Further Actions
- **Test Validation**: Verify actual content display works correctly across different modes and features
- **Performance Optimization**: Consider caching for large prompt sets with many features
- **Content Validation**: Ensure all prompt content sources are properly handled

## [2025-11-03] - CustomFeatureManager Integration in Prompt Builder

### Added
- **Custom Feature Management Section**: Added collapsible "Manage Custom Features" section to Prompt Builder interface
- **Integrated CustomFeatureManager Component**: Users can now access custom feature management directly from Prompt Builder
- **Toggle State Management**: Added state handling for showing/hiding the custom feature manager section
- **UI Integration**: Seamlessly integrated custom feature management without disrupting existing Prompt Builder workflow

### Changed
- **PromptBuilder Component**: Added import for CustomFeatureManager and integrated it into the UI layout
- **Component Structure**: Added collapsible section below custom instructions textarea
- **Test Suite**: Updated PromptBuilder.test.tsx to mock CustomFeatureManager component for proper testing

### Technical Details
- **State Management**: Added `showCustomFeatureManager` boolean state to control section visibility
- **UI Design**: Used collapsible button with rotating arrow icon for intuitive expand/collapse interaction
- **Component Placement**: Positioned after custom instructions to maintain logical workflow (mode selection → features → instructions → management)
- **Backward Compatibility**: All existing functionality remains unchanged

### Files Modified
- `src/components/PromptBuilder.tsx` - Added CustomFeatureManager integration with collapsible UI
- `src/test/PromptBuilder.test.tsx` - Added mock for CustomFeatureManager component

### Impact
- **Enhanced User Experience**: Users can manage custom features without leaving the Prompt Builder context
- **Streamlined Workflow**: Feature management is now part of the prompt building process
- **UI Consistency**: Maintains design patterns with other collapsible sections in the application
- **Accessibility**: Proper focus management and keyboard navigation for the toggle button

---

## [2025-11-03] - Custom Features Integration in Prompt Generation

### Added
- **Custom Features in Prompts**: Custom features now appear in generated prompts with the same formatting as built-in features
- **Drag-and-Drop Order Preservation**: Features are included in prompts respecting their drag-and-drop reordering within each category
- **Category-Based Organization**: Features are collected per category, combining built-in and custom features in logical order

### Changed
- **Prompt Generation Logic**: Updated `generatePrompt()` function to iterate through feature categories and collect enabled features in display order
- **Feature Collection Strategy**: Modified from simple feature filtering to category-based collection with built-in + custom feature merging

### Technical Details
- **Order Preservation**: Custom features maintain their reordered positions within categories during prompt generation
- **Unified Formatting**: Both built-in and custom features use identical `## Feature Name\nDescription` format in output
- **Category Iteration**: Logic now processes features by category to maintain organizational structure in prompts

### Files Modified
- `src/components/PromptBuilder.tsx` - Updated generatePrompt function to include custom features with drag-and-drop order

### Impact
- **Complete Feature Integration**: Custom features are fully integrated into prompt generation process
- **User Experience Enhancement**: Drag-and-drop ordering is respected in final prompt output
- **Consistent Output Format**: All features (built-in and custom) use standardized formatting in generated prompts
- **Backward Compatibility**: Existing prompt generation for built-in features remains unchanged

---

## [2025-11-02] - Extended Types for User-Created Custom Features
## [2025-11-02] - Extended Types for User-Created Custom Features

### Added
- **CustomFeature Type**: New TypeScript interface representing user-created custom features with id, name, description, and category fields
- **ExtendedFeatureState Type**: Enhanced feature state structure separating builtin features, custom features, and ordering array
- **FeatureOrder Type**: Simple string array type for drag-and-drop feature ordering
- **PersistedCustomFeatures Type**: localStorage persistence format with features array and timestamp tracking
- **Updated PromptBuilderState**: Modified to use ExtendedFeatureState instead of simple FeatureState for enhanced functionality

### Technical Details
- **Type Evolution**: Extended existing feature system from simple boolean mapping to structured state with custom features support
- **Drag-and-Drop Foundation**: FeatureOrder type provides basis for reorderable feature lists
- **Persistence Structure**: PersistedCustomFeatures includes versioning with lastModified timestamp for data integrity
- **Backward Compatibility**: ExtendedFeatureState maintains builtin features while adding custom and order properties

### Files Modified
- `src/types.ts` - Added CustomFeature, FeatureOrder, ExtendedFeatureState, and PersistedCustomFeatures types; updated PromptBuilderState interface

### Type Definitions Added
- **CustomFeature**: `{ id: string; name: string; description: string; category: string }`
- **FeatureOrder**: `string[]` (array of feature IDs for ordering)
- **ExtendedFeatureState**: `{ builtin: FeatureState; custom: Record<string, boolean>; order: FeatureOrder }`
- **PersistedCustomFeatures**: `{ features: CustomFeature[]; lastModified: string }`

### Impact
- **Enhanced Flexibility**: Foundation for user-created features beyond built-in feature set
- **Improved Organization**: Separate handling of builtin vs custom features with ordering support
- **Future-Ready Architecture**: Types support drag-and-drop reordering and localStorage persistence
- **Type Safety**: Full TypeScript coverage for new feature management capabilities
21:00 + 2025-11-22, Fix ReferenceError in ColoredPromptDisplay component,
What's changed: Moved extractKeywords and findBestMatch function definitions before their usage in useMemo hook to resolve ReferenceError: Cannot access 'extractKeywords' before initialization.
Why: Functions were declared after being called in the component execution order, violating JavaScript's temporal dead zone for const declarations.
Issues encountered: TypeScript compilation errors due to redeclared variables during the move.
Why and how solved: Removed duplicate function declarations after moving them to the correct position before the useMemo hook.
Which git branch: visualizer-next
Impacted files: src/components/ColoredPromptDisplay.tsx (lines reordered, no functional changes)
Further actions: None required - fix is complete and tested.

---

## [2025-11-22] - Lego-Style Prompt Display Implementation

### What's Changed
- **Transformed Architecture**: Replaced inline text highlighting with discrete Lego-style block rendering in `ColoredPromptDisplay` component
- **New Component**: Created `PromptDisplayBlock` component with Lego visual styling (rounded corners, shadows, stud decorations)
- **Data Flow**: Implemented structured block generation with proper parsing of prompt sections (base mode, features, custom instructions)
- **Integration**: Enhanced `ColoredPromptDisplay` to render `PromptDisplayBlock` components instead of continuous colored text
- **Feature Ordering**: Preserved drag-drop feature order in block display sequence
- **Backward Compatibility**: Maintained all existing functionality (copy, toggle views, feature legend)

### Why (ADR Links)
- [docs/LegoPromptDisplay-Plan.md](docs/LegoPromptDisplay-Plan.md) - Architectural transformation from text parsing to structured rendering for better maintainability and visual clarity
- Improved user experience through modular block visualization representing prompt composition

### Issues Encountered
- **Text Parsing Complexity**: Initial challenge in extracting feature content from structured prompt text using regex patterns
- **Block Ordering**: Ensuring features display in drag-drop order required careful integration with existing data flow
- **Styling Consistency**: Achieving consistent Lego visual metaphor across different block types and screen sizes

### Why and How Solved
- **Text Parsing**: Implemented robust extraction functions (`extractBaseModeContent`, `extractFeatureContent`, `extractCustomContent`) with fallback regex patterns and string manipulation
- **Block Ordering**: Modified `promptBlocks` useMemo to iterate through `enabledFeatures` array, preserving their order from PromptBuilder drag-drop functionality
- **Styling**: Leveraged existing `getFeatureColor()` system with extended colors for base and custom types; applied consistent Lego styling (rounded corners, shadows, studs) using Tailwind classes

### Which Git Branch
visualizer-next

### Impacted Files
- `src/components/ColoredPromptDisplay.tsx` - Major refactoring: replaced text parsing with block rendering, added structured block generation logic
- `src/components/PromptDisplayBlock.tsx` - New component: individual block rendering with Lego styling, type-specific indicators, and responsive design
- `src/types.ts` - Added `DisplayPromptBlock` interface for type safety
- `src/test/LegoPromptDisplay.test.tsx` - New comprehensive test suite covering component rendering and integration
- `lego-prompt-display-test-report.md` - Test results documentation

### Further Actions
- **Test Infrastructure**: Address automated test setup issues (Vitest mocking, DOM testing library configuration) in separate task
- **Performance Monitoring**: Test with large prompt sets (>20 features) to ensure acceptable rendering performance
- **Accessibility Audit**: Verify color contrast ratios and keyboard navigation for block interactions
- **Mobile Testing**: Conduct manual testing on actual mobile devices for responsive design validation