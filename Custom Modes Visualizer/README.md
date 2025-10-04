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

### ✨ Core Features
- **Live Editing**: Real-time editing with auto-save
- **Mode Creation**: Create new custom modes with the Create Mode feature
- **Family Organization**: Organize modes into families for better management
- **Family Filtering**: Multi-select dropdown to filter modes by family in all views
- **Selective Export**: Export only custom modes (excluding Default family)
- **Responsive Design**: Works perfectly on desktop and mobile
- **Type Safety**: Full TypeScript support for reliability
- **Fast Performance**: Built with Vite for lightning-fast development
- **Clean UI**: Modern interface with Tailwind CSS

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

### Views Overview

#### Table View
Perfect for quick edits and getting an overview of all modes. Click any field to edit directly. Use the family selector to filter modes by family.

#### Smart View
Ideal for deep editing of individual modes. Navigate through modes with tabs or arrow buttons. Use the family selector to filter modes by family.

#### Prompt Builder
Create custom prompts by selecting base modes and adding specific instructions. Copy the result.

## 🎯 Current Modes

The application comes pre-loaded with these Roo modes, organized in the **Default** family:

- **🏗️ Architect**: Plans system architecture and technical designs
- **💻 Code**: Writes and modifies code
- **🐛 Debug**: Troubleshoots issues and diagnoses problems
- **❓ Ask**: Provides explanations and answers questions
- **🎯 Orchestrator**: Coordinates complex multi-step projects

### Family Organization
Modes are organized into families for better management. The Default family contains all built-in modes. You can create custom families and organize your modes accordingly.

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Persistence**: Browser localStorage
- **Icons**: Emoji-based for accessibility

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ModeTable.tsx    # Editable table component
│   ├── ModeDetail.tsx   # Detailed mode editing
│   ├── PromptBuilder.tsx # Prompt construction UI
│   ├── Navbar.tsx       # Navigation component
│   └── FamilySelector.tsx # Multi-select family filter dropdown
├── pages/              # Page-level components
├── context/            # React Context for state
├── data/               # Static data files
│   ├── modes.json       # Mode definitions with family assignments
│   └── default-family.json # Default family configuration
├── types.ts            # TypeScript definitions
└── App.tsx             # Main application component
```

## 🔮 Future Plans

- [ ] Mode deletion
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Mode templates and presets

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

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the Roo Code, Cline, React, TypeScript, and Tailwind CSS communities

---

**Made with ❤️ by Roo for the Roo community**