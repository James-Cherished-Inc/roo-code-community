# YAML/JSON Export & Import Enhancement Plan

## 📋 Overview
This plan outlines the implementation of dual-format support (YAML and JSON) for mode export and import functionality in the Custom Modes Visualizer application.

## 🎯 Success Metrics
- **Export Enhancement**: "Export Modes" button opens modal for mode selection and format choice (YAML/JSON)
- **Import Enhancement**: Import button supports both YAML and JSON file formats seamlessly

## 📊 Data Format Specifications

### Current Mode Structure (Internal)
```typescript
Mode = {
  slug: string,
  name: string,
  description: string,
  usage: string,
  prompt: string,
  family?: string
}
```

### Export/Import Format Structure
```typescript
ExportMode = {
  slug: string,
  name: string,
  description: string,
  roleDefinition: string,  // Maps to current 'prompt'
  whenToUse: string,       // Maps to current 'usage'
  groups: string[]         // Fixed value: ["read", "edit", "browser", "command", "mcp"]
}
```

### Format Mappings
- **roleDefinition** ← **prompt** (current field)
- **whenToUse** ← **usage** (current field)
- **groups** ← Fixed array `["read", "edit", "browser", "command", "mcp"]` (constant)
- **family** ← Preserved internally but NOT exported; imported modes get "standalone" family

## 🏗️ Implementation Architecture

### Phase 1: Foundation & Types
**Objective**: Establish technical foundation and type safety.

**1.1 New TypeScript Types**
```typescript
// New export/import format type
interface ExportMode {
  slug: string;
  name: string;
  description: string;
  roleDefinition: string;
  whenToUse: string;
  groups: string[];
}

// Enhanced context interface
interface EnhancedModeContextType extends ModeContextType {
  exportSelectedModes: (format: 'json'|'yaml', selectedSlugs: string[]) => boolean;
  importFromFile: (file: File) => Promise<boolean>;
}
```

**1.2 Dependencies**
```json
{
  "js-yaml": "^4.1.0"
}
```

### Phase 2: Core Conversion Logic
**Objective**: Create robust format conversion utilities.

**2.1 Format Conversion Utilities**
- `modeToExportMode(mode: Mode): ExportMode`
- `exportModeToMode(exportMode: ExportMode): Mode`
- `detectFileFormat(filename: string): 'json'|'yaml'|null`
- `parseFileContent(text: string, format: 'json'|'yaml'): ExportMode[]`

**2.2 Data Transformation Rules**
```typescript
// Export transformation
exportMode = {
  slug: mode.slug,
  name: mode.name,
  description: mode.description,
  roleDefinition: mode.prompt,
  whenToUse: mode.usage,
  groups: ["read", "edit", "browser", "command", "mcp"] // Fixed value
}

// Import transformation
mode = {
  slug: exportMode.slug,
  name: exportMode.name,
  description: exportMode.description,
  usage: exportMode.whenToUse,
  prompt: exportMode.roleDefinition,
  family: "standalone" // Default assignment
}
```

### Phase 3: ExportModal Component
**Objective**: Create intuitive export interface with mode selection.

**3.1 ExportModal Features**
- **Mode Selection**: Checkbox list of all available modes
- **Format Selection**: Radio buttons for JSON/YAML choice
- **Bulk Actions**: Select All/None convenience buttons
- **Preview**: Show count of selected modes and chosen format
- **Export Process**: Loading state during file generation
- **Error Handling**: Clear feedback for export failures

**3.2 Component Structure**
```
ExportModal
├── Mode Selection List (Virtualized for performance)
├── Format Selector (JSON/YAML radio buttons)
├── Action Buttons (Select All/None/Export/Cancel)
├── Status Messages (Success/Error with format context)
└── Preview Section (Selected count + format indicator)
```

### Phase 4: Enhanced Import Support
**Objective**: Extend existing import functionality for dual formats.

**4.1 ImportModal Enhancements**
- **Format Detection**: Auto-detect from file extension
- **Format Indicator**: Show detected format in UI
- **Enhanced Validation**: Format-specific error messages
- **Preview Support**: Show import preview with format badge

**4.2 File Format Support**
- **Accepted Extensions**: `.json`, `.yaml`, `.yml`
- **MIME Type Handling**: `application/json`, `application/x-yaml`
- **Fallback Strategy**: Clear error if format cannot be determined

### Phase 5: Context Integration
**Objective**: Integrate new functionality into existing mode management.

**5.1 Enhanced Context Functions**
```typescript
// New export function
exportSelectedModes = (format: 'json'|'yaml', selectedSlugs: string[]) => {
  const selectedModes = modes.filter(mode => selectedSlugs.includes(mode.slug));
  const exportModes = selectedModes.map(modeToExportMode);

  const content = format === 'yaml'
    ? yaml.dump({ customModes: exportModes })
    : JSON.stringify({ customModes: exportModes }, null, 2);

  // File download logic (reuse existing pattern)
  downloadFile(content, `modes-export.${format}`, `application/${format}`);
}

// Enhanced import function
importFromFile = async (file: File) => {
  const format = detectFileFormat(file.name);
  if (!format) return false;

  try {
    const text = await file.text();
    const parsedData = parseFileContent(text, format);

    // Validate structure matches expected format
    if (!isValidExportFormat(parsedData)) return false;

    // Convert to internal format and import
    const modes = parsedData.customModes.map(exportModeToMode);
    return importModesFromJson(modes, 'add');

  } catch (error) {
    console.error(`Failed to import ${format.toUpperCase()} file:`, error);
    return false;
  }
}
```

### Phase 6: UI Integration
**Objective**: Update existing UI to use new functionality.

**6.1 TableViewPage Updates**
- Replace direct `exportModesToJson()` call with ExportModal trigger
- Update import button to use enhanced import functionality
- Add format indicators where relevant

**6.2 Navigation Integration**
- Update "Export Modes" button text/clarity
- Add visual indicators for format support
- Ensure consistent UX patterns

## 🧪 Testing Strategy

### 7.1 Format Conversion Testing
- **Round-trip Testing**: Export → Import → Verify data integrity
- **Cross-format Testing**: Export JSON → Import as YAML (and vice versa)
- **Edge Case Testing**: Empty selections, special characters, large datasets

### 7.2 Error Scenario Testing
- **Invalid Files**: Wrong format, corrupted data, missing fields
- **Browser Compatibility**: File API support across browsers
- **Large Files**: Performance with many modes (>100)

### 7.3 User Experience Testing
- **Modal Workflows**: Complete export/import flows
- **Error Recovery**: User can recover from error states
- **Visual Feedback**: Loading states, success/error messages

## 📚 Documentation Updates

### 8.1 Master Implementation Plan
- Add new format support to technical specifications
- Document data transformation rules
- Update architecture diagrams

### 8.2 User Documentation
- Create `/docs/Export-Import-Guide.md` with usage examples
- Include format specifications and examples
- Add troubleshooting section for common issues

### 8.3 Developer Documentation
- Update `/docs/Developer-Guide.md` with implementation details
- Document conversion utilities and their usage
- Include testing guidelines for format features

## 🔄 Implementation Phases

### Phase 1: Foundation (1-2 days)
- [ ] Add TypeScript types for export/import formats
- [ ] Install and configure js-yaml dependency
- [ ] Create format conversion utilities
- [ ] Add comprehensive error handling

### Phase 2: Export Functionality (2-3 days)
- [ ] Create ExportModal component with mode selection
- [ ] Implement export logic for both JSON and YAML
- [ ] Add file download functionality
- [ ] Integrate with existing TableViewPage

### Phase 3: Import Enhancement (1-2 days)
- [ ] Enhance ImportModal for format detection
- [ ] Add YAML parsing support to import logic
- [ ] Implement format-specific validation
- [ ] Add import preview functionality

### Phase 4: Polish & Testing (2-3 days)
- [ ] Comprehensive testing across formats
- [ ] UI/UX improvements and consistency checks
- [ ] Performance optimization for large datasets
- [ ] Cross-browser compatibility verification

### Phase 5: Documentation (1 day)
- [ ] Update master implementation plan
- [ ] Create user guide with examples
- [ ] Document technical implementation details
- [ ] Add changelog entry

## ⚡ Technical Considerations

### Performance Impact
- **Minimal Runtime Impact**: YAML parsing adds ~50KB to bundle size
- **Processing Overhead**: Negligible for typical mode counts (<100 modes)
- **Memory Usage**: File parsing happens in background, no memory leaks

### Browser Compatibility
- **File API**: Supported in all modern browsers (IE11+)
- **YAML Library**: Pure JavaScript, no native dependencies
- **Download API**: Consistent across browsers via blob URLs

### Error Handling Strategy
- **Graceful Degradation**: Falls back to JSON if YAML parsing fails
- **User-Friendly Messages**: Format-specific error descriptions
- **Recovery Options**: Clear paths forward for failed operations

## 🎉 Success Criteria

### Functional Requirements ✅
- Export modal allows mode selection and format choice
- Both YAML and JSON formats generate correctly structured files
- Import accepts both formats with proper data transformation
- Family assignment works correctly (standalone for imports)

### User Experience Requirements ✅
- Intuitive interface for format selection
- Clear feedback throughout export/import processes
- Consistent behavior between YAML and JSON workflows
- Helpful error messages for troubleshooting

### Technical Requirements ✅
- Type-safe implementation with proper TypeScript support
- Robust error handling and validation
- Performance-conscious implementation
- Maintainable code structure following existing patterns

---

*This plan provides a comprehensive roadmap for implementing YAML/JSON format support while maintaining backward compatibility and following the project's existing architecture patterns.*