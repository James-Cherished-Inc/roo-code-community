# Export & Import Guide

## Overview
The Roo Modes Visualizer supports exporting and importing modes in both JSON and YAML formats. This allows for flexible data exchange and backup of your custom mode configurations.

## Exporting Modes

### Export Process
1. Navigate to the **Table View** page
2. Click the **"Export Modes"** button
3. In the export modal:
   - **Select formats**: Choose between JSON or YAML
   - **Select modes**: Check/uncheck individual modes to export
   - **Use bulk actions**: "Select All" or "Select None" for convenience
   - Click **"Export"** to download the file

### Export Features
- **Selective Export**: Choose exactly which modes to export
- **Format Choice**: Export as JSON or YAML
- **Family Assignment**: Exported modes automatically get "standalone" family when imported elsewhere

## Importing Modes

### Import Process
1. Navigate to the **Table View** page
2. Click the **"Import"** button
3. In the import modal:
   - Select a JSON or YAML file (.json, .yaml, or .yml)
   - The system automatically detects the file format
   - Choose import strategy (add to existing modes)
   - Click **"Import"** to process the file

### Import Features
- **Auto-detection**: Automatically recognizes JSON vs YAML files
- **Format Support**: Accepts both JSON and YAML formats
- **Validation**: Ensures imported data matches expected structure
- **Family Assignment**: Imported modes get "standalone" family

## File Formats

### JSON Format
```json
{
  "customModes": [
    {
      "slug": "architect",
      "name": "🏗️ Architect",
      "description": "Plans system architecture and technical designs",
      "roleDefinition": "You are Roo, an experienced technical leader...",
      "whenToUse": "Use for initial planning of complex systems",
      "groups": ["read", "edit", "browser", "command", "mcp"]
    }
  ]
}
```

### YAML Format
```yaml
customModes:
  - slug: architect
    name: 🏗️ Architect
    description: Plans system architecture and technical designs
    roleDefinition: You are Roo, an experienced technical leader...
    whenToUse: Use for initial planning of complex systems
    groups:
      - read
      - edit
      - browser
      - command
      - mcp
```

## Data Mapping

### Internal to Export Format
- `mode.prompt` → `roleDefinition`
- `mode.usage` → `whenToUse`
- `groups` → Fixed array `["read", "edit", "browser", "command", "mcp"]`

### Export to Internal Format
- `roleDefinition` → `mode.prompt`
- `whenToUse` → `mode.usage`
- `family` → Always set to `"standalone"` for imported modes

## Common Use Cases

### Backup Custom Modes
1. Export all custom modes (excluding default family)
2. Store the export file safely
3. Import when needed to restore configuration

### Share Mode Configurations
1. Select specific modes to export
2. Choose preferred format (JSON/YAML)
3. Share the file with team members
4. Others can import to get the same mode setup

### Format Conversion
1. Import a JSON file
2. Export as YAML (or vice versa)
3. File serves as format converter

## Troubleshooting

### Export Issues
- **No modes selected**: Ensure at least one mode is checked before exporting
- **File not downloading**: Check browser popup blockers and try again

### Import Issues
- **Unsupported format**: Ensure file has .json, .yaml, or .yml extension
- **Invalid structure**: Verify file follows the expected format (see examples above)
- **Duplicate slugs**: System will add imported modes even if slugs conflict

### File Size Limits
- Large files may take longer to process
- Browser limitations may affect very large exports
- Consider splitting large exports into smaller batches

## Best Practices

### Organization
- Use descriptive filenames (e.g., `my-custom-modes-2024.yaml`)
- Include date/version in filename for tracking
- Store exports in version control for backup

### Collaboration
- Use consistent format (JSON or YAML) within teams
- Document custom mode purposes when sharing
- Validate imports before relying on them

### Performance
- Export only needed modes to keep files manageable
- Consider YAML for human-readable configurations
- Use JSON for programmatic processing

## Technical Details

### Dependencies
- **js-yaml**: YAML parsing and serialization library
- **File API**: Browser native file handling
- **Blob API**: File download generation

### Validation
- File extension checking (.json, .yaml, .yml)
- Content structure validation
- Required field verification
- Type checking for all properties

### Error Handling
- Format detection failures
- Parsing errors with descriptive messages
- Validation failures with specific feedback
- Fallback behaviors for edge cases