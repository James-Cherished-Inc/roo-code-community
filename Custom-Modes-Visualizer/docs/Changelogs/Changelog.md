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