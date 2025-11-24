# ADR: Family Mode Import Duplicate Handling Enhancement

## Title
Flexible Suffix-Based Duplicate Resolution for Family Mode Imports

## Status
Accepted

## Context
The Custom Modes Visualizer application needed to enhance family mode import functionality to provide users with greater control over how duplicate mode slugs are handled during batch imports. The existing system only provided automatic numbering (e.g., `mode-name-2`, `mode-name-3`) which was insufficient for user workflow management.

## Decision
Implemented a flexible suffix-based duplicate resolution system with three distinct strategies:

1. **Automatic Numbering**: Maintains existing behavior (`mode-name-2`, `mode-name-3`)
2. **Filename-Based**: Uses source filename for suffix generation (`mode-name-myfile`)  
3. **User-Defined**: Allows custom suffix input for entire import batch (`mode-name-custom`)

### Technical Implementation
- Extended `generateUniqueSlug` function with optional `customSuffix` parameter
- Modified `resolveSlugConflicts` to pass custom suffix through pipeline
- Added conditional UI rendering based on import strategy (family vs individual)
- Integrated with ModeContext for seamless suffix propagation

## Alternatives Considered

### Alternative 1: Configuration File Approach
**Rejected**: Store duplicate handling preferences in external JSON config files
- **Pros**: Persistent settings across sessions
- **Cons**: Added complexity, file management overhead, potential conflicts with user workflows

### Alternative 2: Import Strategy Per-Mode
**Rejected**: Allow different suffix strategies for individual modes within same import
- **Pros**: Maximum flexibility for complex import scenarios
- **Cons**: UI complexity explosion, potential user confusion, increased error rates

### Alternative 3: Automatic Smart Suffixing
**Rejected**: AI-driven suffix generation based on mode content analysis
- **Pros**: Intelligent suggestions based on mode characteristics
- **Cons**: Complex implementation, potential performance impact, non-deterministic behavior

## Consequences

### Positive
- **User Control**: Three clear, intuitive options with visual examples
- **Backward Compatibility**: Automatic numbering preserved as default option
- **Extensible Design**: Custom suffix parameter enables future strategies
- **Type Safety**: Full TypeScript compliance maintained

### Technical Trade-offs
- **UI Complexity**: Additional state management for conditional rendering
- **Context Updates**: Required changes to ModeContext interface
- **Testing Requirements**: Multiple scenario coverage needed

### User Experience Impact
- **Learning Curve**: Minimal - visual examples demonstrate each option clearly
- **Workflow Enhancement**: Users can now batch import with predictable naming
- **Error Reduction**: Clear examples reduce user confusion during import process

## Links
- Code Implementation: `docs/Changelog/Code/2025-11-23-Family-Mode-Import-Duplicate-Handling.md`
- UI Component: `src/components/ImportModal.tsx`
- Core Logic: `src/utils/formatConversion.ts`
- Context Integration: `src/context/ModeContext.tsx`

## Date
2025-11-23

## Review
This decision should be reviewed when:
- User feedback indicates preference for additional suffix strategies
- Performance issues arise with large batch imports
- Alternative import workflows emerge requiring different conflict resolution