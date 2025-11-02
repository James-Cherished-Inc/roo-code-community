# 🦘 Roo Modes Visualizer

A modern, intuitive web application for managing and visualizing AI assistant modes (personas) in the Roo system. Built with React, TypeScript, and Tailwind CSS for a seamless editing experience.

![Roo Modes Visualizer](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC) ![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF)

## 🌟 Features

### 📋 Table View
- **Editable Table**: Click any cell to edit mode properties inline
- **Comprehensive Overview**: See all modes at a glance
- **Live Updates**: Changes save automatically to localStorage

### 🎯 Smart View
- **Focused Editing**: View and edit one mode at a time
- **Tabbed Navigation**: Easy switching between modes
- **Detailed Forms**: Full editing capabilities for all mode properties

### 🔧 Prompt Builder
- **Custom Construction**: Build prompts from base modes
- **Flexible Options**: Add custom instructions and modifications
- **Copy to Clipboard**: Export generated prompts instantly
- **Work in Progress Indicator**: Clear notification about development status

### 🎯 Advanced Mode Management
- **Create Custom Modes**: Comprehensive form with emoji selector, validation, and unique slug checking
- **Mode Deletion**: Safe deletion with confirmation modal to prevent accidental removal
- **Granular Editing**: Double-click any field for inline editing in both Table and Smart views
- **Keyboard Shortcuts**: Ctrl+Enter to save, Esc to cancel edits for power users
- **Copy to Clipboard**: Copy individual fields or generated content instantly

### 🔄 Import & Export System
- **Dual Format Support**: Export and import modes in both JSON and YAML formats
- **Selective Export**: Choose exactly which modes to export with checkbox selection
- **Auto-Format Detection**: Automatically detects and handles JSON/YAML files
- **Conflict Resolution**: Smart handling of duplicate slugs during import
- **Family Assignment**: Imported modes automatically organized into families
- **Bulk Operations**: Select all/none options for efficient mode management

### 📊 Cross-Mode Analysis
- **Redundancy Highlighter**: Interactive analysis showing redundant words across all modes
- **Visual Highlighting**: Color-coded highlighting with adjustable frequency thresholds
- **Interactive Filtering**: Right-click context menu to exclude or focus on specific words
- **Real-time Statistics**: Live stats showing redundancy percentage and most frequent terms
- **Collapsible Analysis Panel**: Expandable right panel in Smart View with comprehensive analysis

### 🏷️ Family Management System
- **Create New Families**: Build custom families with colors, descriptions, and organization
- **Family Selection Modal**: Intuitive interface for choosing existing or creating new families
- **Dynamic Filtering**: Real-time filtering of modes by multiple selected families
- **Family-Based Storage**: Organized data structure with family-contained mode definitions
- **Visual Indicators**: Color-coded family themes throughout the interface

### 🔧 Advanced Configuration
- **Global Modes Field**: Set common instructions that apply to all modes below the table
- **Reset Functionality**: Complete reset to default state with confirmation and page refresh
- **Persistent Storage**: localStorage with family-based organization and auto-save
- **Global Configuration**: Centralized instructions that prepend to all mode prompts

### 📱 Enhanced User Experience
- **About Panel**: Slide-in overlay with project information, social links, and community resources
- **Responsive Design**: Optimized for desktop and mobile with adaptive layouts
- **Loading States**: Professional loading indicators and empty states
- **Error Handling**: Comprehensive validation with user-friendly error messages
- **Confirmation Modals**: Safe destructive actions with detailed warnings

### ✨ Core Features
- **Live Editing**: Real-time editing with auto-save to localStorage
- **Mode Creation**: Create new custom modes with emoji selector and validation
- **Family Organization**: Organize modes into families with visual themes
- **Family Filtering**: Multi-select dropdown to filter modes by family in all views
- **Global Configuration**: Set common instructions that apply to all modes
- **Selective Export**: Export only chosen modes (excluding Default family by default)
- **About Panel**: Access project information, community links, and documentation via slide-in overlay
- **Responsive Design**: Works perfectly on desktop and mobile
- **Type Safety**: Full TypeScript support for reliability
- **Fast Performance**: Built with Vite for lightning-fast development
- **Clean UI**: Modern interface with Tailwind CSS and glassmorphism effects

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roo-modes-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

That's it! The application will be running with hot reload for development.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 📖 How to Use

### Getting Started
1. The app opens in **Table View** by default
2. Use the navigation tabs to switch between views
3. Your changes are automatically saved to browser storage

### Editing Modes
- **Table View**: Click on any cell to edit inline, use family selector to filter modes
- **Smart View**: Use the detailed form for comprehensive editing, use family selector to filter modes
- **Prompt Builder**: Select a base mode and customize as needed

### Using the About Panel
- Click the **About** button (ℹ️ icon) in the navbar to open the information panel
- The panel slides in from the right with project details, community links, and support options
- Close by clicking the × button, clicking outside the panel, or pressing the ESC key

### Views Overview

#### Table View
Perfect for quick edits and getting an overview of all modes. Click any cell to edit inline, use the family selector to filter modes, create new modes, import/export configurations, and reset to defaults. Includes global configuration field below the table.

#### Smart View
Ideal for deep editing of individual modes with a sidebar navigation layout. Use the left sidebar to select modes, double-click any field to edit, navigate with arrow buttons, and access import/export functions. Features a collapsible cross-mode redundancy analysis panel on the right for comparing prompts across all filtered modes.

#### Prompt Builder
Create custom prompts by selecting base modes and adding specific instructions. Copy the result. Currently in development with work-in-progress indicator.

#### About Panel
Access project information, community links, and documentation through the slide-in overlay panel. Learn about Roo Modes Visualizer, view author information, and connect with the Roo Code community.

## 🎯 Current Modes

The application comes pre-loaded with these Roo modes, organized in the **Default Modes** family:

- **🏗️ Architect**: Plans system architecture and technical designs
- **💻 Code**: Writes and modifies code
- **🐛 Debug**: Troubleshoots issues and diagnoses problems
- **❓ Ask**: Provides explanations and answers questions
- **🎯 Orchestrator**: Coordinates complex multi-step projects

### Family Organization
Modes are organized into families for better management. The Default Modes family contains all built-in modes. You can create custom families and organize your modes accordingly.

## 🛠️ Updating Hardcoded Families and Prompts

The application loads three predefined mode families on startup from JSON files in the `src/data/` directory:

- `default-family.json` - Core Roo modes (architect, code, debug, ask, orchestrator)
- `standalone-family.json` - Empty family for imported modes and user-created modes
- `cherished-family.json` - Advanced specialized modes (battle-tested experiments)

### How to Update Families and Prompts

**Location**: `Custom-Modes-Visualizer/src/data/`

**File Format**: Each family file follows this JSON structure:

```json
{
  "id": "family-slug",
  "name": "Family Display Name",
  "description": "Brief description of the family",
  "color": "#HEXCOLOR",
  "isDefault": false,
  "customModes": [
    {
      "slug": "mode-slug",
      "name": "🏷️ Display Name",
      "description": "Short description",
      "roleDefinition": "Full prompt text defining the mode's behavior...",
      "whenToUse": "When to use this mode...",
      "groups": ["read", "edit", "browser", "command", "mcp"]
    }
  ]
}
```

### Steps to Update

1. **Edit the JSON file** directly in `src/data/`
2. **Modify mode properties**:
   - `roleDefinition`: The full prompt that defines the mode's behavior
   - `name`: Emoji + display name
   - `description`: Brief summary
   - `whenToUse`: Usage guidelines
   - `groups`: Tool permissions array
3. **Save the file**
4. **Restart the development server** (`npm run dev`) to reload the changes

### Important Notes

- Changes to hardcoded families require a full app restart to take effect
- The `default` family cannot be deleted (protected in code)
- Use unique `slug` values across all families to avoid conflicts
- See [`types.ts`](src/types.ts) for complete TypeScript interfaces
- Test changes thoroughly before committing

### Managing Families and Modes
- **Creating Families**: Use the Family Selection Modal when creating modes
- **Importing Families**: Import family files to bring in entire mode collections
- **Family Colors**: Choose distinct colors for visual organization
- **Mode Assignment**: Modes automatically belong to their creation family

### Example: Adding a New Mode

```json
{
  "slug": "new-mode",
  "name": "🔧 New Mode",
  "description": "Handles specific task type",
  "roleDefinition": "You are a specialized assistant for [task]. Always [guidelines]...",
  "whenToUse": "Use when you need to [specific use case]",
  "groups": ["read", "edit", "command"]
}
```

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with glassmorphism effects
- **State Management**: React Context API with localStorage persistence
- **Persistence**: Family-based localStorage with auto-save
- **Icons**: Emoji-based for accessibility
- **File Processing**: YAML/JSON import/export with js-yaml library
- **UI Components**: Custom modals, form validation, and interactive panels

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ModeTable.tsx        # Editable table component with inline editing
│   ├── ModeDetail.tsx       # Detailed mode editing with double-click support
│   ├── PromptBuilder.tsx    # Prompt construction UI (work in progress)
│   ├── Navbar.tsx           # Navigation component with About button
│   ├── FamilySelector.tsx   # Multi-select family filter dropdown
│   ├── AboutPanel.tsx       # Slide-in information panel component
│   ├── CreateModeModal.tsx  # Modal for creating new modes with validation
│   ├── ExportModal.tsx      # Selective export modal with format choice
│   ├── ImportModal.tsx      # Import modal with strategy selection
│   ├── GlobalModesField.tsx # Global configuration field for all modes
│   ├── ResetConfirmationModal.tsx # Confirmation modal for reset operations
│   ├── RedundancyHighlighter.tsx  # Cross-mode redundancy analysis component
│   └── FamilySelectionModal.tsx   # Modal for family selection and creation
├── pages/              # Page-level components
│   ├── TableViewPage.tsx     # Table view with all controls and global field
│   ├── SmartViewPage.tsx     # Smart view with sidebar and analysis panel
│   └── PromptBuilderPage.tsx # Prompt builder (development status)
├── context/            # React Context for state management
│   └── ModeContext.tsx       # Centralized state management with localStorage
├── data/               # Static family data files
│   ├── default-family.json    # Core Roo modes (architect, code, debug, ask, orchestrator)
│   ├── standalone-family.json # User-created and imported modes
│   └── cherished-family.json  # Battle-tested specialty modes
├── types.ts            # TypeScript definitions
├── utils/              # Utility functions
│   ├── formatConversion.ts   # Data transformation and file handling
│   ├── tokenEstimation.ts    # Token counting utilities
│   └── redundancyAnalysis.ts # Cross-mode redundancy analysis
└── test/               # Test suite
    ├── AboutPanel.test.tsx   # Component tests
    ├── ModeTable.test.tsx    # Component tests
    └── setup.ts              # Test configuration
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind imports
```

## 🔮 Future Plans

- [x] Mode deletion (implemented)
- [x] Keyboard shortcuts (Ctrl+Enter, Esc implemented)
- [ ] Search and filtering capabilities
- [ ] Drag and drop reordering
- [ ] Advanced family management (merge, split, export families)
- [ ] Mode versioning and history
- [ ] Collaborative features
- [ ] Bulk editing operations
- [ ] Mode performance analytics
- [ ] Custom themes
- [ ] Plugin system for extending functionality

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Add tests for new features
- Update documentation as needed

## 📄 Documentation

- **[Master Implementation Plan](./docs/Master-Implementation-Plan.md)** - Technical roadmap and decisions
- **[Changelog](./docs/Changelog.md)** - Version history and changes
- **[Export Import Guide](./docs/Export-Import-Guide.md)** - Complete guide for importing and exporting modes
- **[Prompt Optimization Suite Plan](./docs/Prompt-Optimization-Suite-Plan.md)** - Future development roadmap
- **[Testing Export Selected Modes](./docs/Testing-ExportSelectedModes.md)** - Test documentation for export functionality

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the Roo Code, Cline, React, TypeScript, and Tailwind CSS communities

---

**Made with ❤️ by Roo for the Roo community**