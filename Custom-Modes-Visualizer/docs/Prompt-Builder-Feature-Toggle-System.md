# 🔧 Prompt Builder Feature Toggle System

## Overview

The Prompt Builder Feature Toggle System enables users to construct custom AI assistant prompts by combining base mode templates with modular, toggleable feature enhancements. This system allows for the creation of highly specialized prompts tailored to specific use cases while maintaining consistency and reusability.

## Feature Overview

### What It Does
The feature toggle system transforms the basic Prompt Builder from a simple template selector into a sophisticated prompt engineering tool. Users can:

- Start with any base mode (architect, code, debug, etc.)
- Select from 9 toggleable feature enhancements across 4 categories
- Add custom instructions for further specialization
- Generate professional, standardized prompts instantly
- Copy completed prompts to clipboard for immediate use

### Benefits
- **Modularity**: Features can be mixed and matched without conflict
- **Consistency**: Standardized instruction blocks ensure predictable behavior
- **Flexibility**: Custom instructions allow for unlimited specialization
- **Efficiency**: Rapid prompt construction without manual writing
- **Quality**: Pre-tested feature combinations ensure high-quality outputs
- **Maintainability**: Centralized feature definitions enable easy updates

## Technical Implementation

### Data Structure

#### Feature Categories
```typescript
type FeatureCategory = {
  id: string;           // Unique identifier ('communication-style', 'process-planning', etc.)
  name: string;         // Display name ('Communication Style', 'Process & Planning')
  description: string;  // Category purpose description
};
```

#### Feature Definitions
```typescript
type FeatureDefinition = {
  id: string;                           // Unique identifier ('empathyFriendlyTone', etc.)
  name: string;                         // Display name ('Empathy & Friendly Tone Guidelines')
  description: string;                  // Detailed feature explanation
  category: string;                     // Category ID this feature belongs to
  defaultEnabled: Record<string, boolean>; // Default state per mode (modeSlug -> boolean)
};
```

#### Feature State
```typescript
type FeatureState = Record<string, boolean>; // Current enabled/disabled state (featureId -> boolean)
```

### Component Architecture

The Prompt Builder consists of several key components:

#### Main Component (PromptBuilder.tsx)
```typescript
interface PromptBuilderProps {
  modes: Mode[];  // Available base modes
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ modes }) => {
  // State management
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureState>({});
  const [copyMessage, setCopyMessage] = useState(false);
  // ... handlers and render logic
};
```

#### Key Methods
- `handleModeSelect()`: Sets base mode and loads default feature states
- `handleFeatureToggle()`: Updates individual feature enabled/disabled state
- `generatePrompt()`: Combines base mode, enabled features, and custom instructions
- `copyToClipboard()`: Copies generated prompt to system clipboard

### Prompt Generation Logic

The prompt generation follows this structure:

```typescript
const generatePrompt = () => {
  if (!selectedMode) return;

  let prompt = selectedMode.prompt;

  // Add enabled features as standardized instruction blocks
  const enabledFeatures = features.filter(feature => selectedFeatures[feature.id]);
  if (enabledFeatures.length > 0) {
    prompt += '\n\n--- Feature Enhancements ---\n';
    enabledFeatures.forEach(feature => {
      prompt += `\n## ${feature.name}\n${feature.description}\n`;
    });
  }

  // If there's custom content, integrate it
  if (customPrompt.trim()) {
    prompt += `\n\nAdditional Instructions: ${customPrompt}`;
  }

  setGeneratedPrompt(prompt);
};
```

### Helper Functions

#### Feature Filtering
```typescript
export const getFeaturesByCategory = (categoryId: string): FeatureDefinition[] => {
  return features.filter(feature => feature.category === categoryId);
};
```

#### Default Feature Loading
```typescript
export const getDefaultFeaturesForMode = (modeSlug: string): FeatureState => {
  const state: FeatureState = {};
  features.forEach(feature => {
    state[feature.id] = feature.defaultEnabled[modeSlug] ?? false;
  });
  return state;
};
```

## User Guide

### Getting Started
1. Navigate to the Prompt Builder view (🔧 tab)
2. Select a base mode from the "Select Base Mode" grid
3. Review the pre-selected feature toggles (based on mode defaults)
4. Customize feature selections as needed
5. Add any additional instructions in the textarea
6. Click "🚀 Generate Prompt"
7. Copy the result using the "📋 Copy to Clipboard" button

### Feature Toggle Interface
- **Category Organization**: Features are grouped into logical categories with clear descriptions
- **Checkbox Controls**: Each feature has a checkbox with its name and detailed description
- **Visual Feedback**: Selected mode and features are highlighted
- **Real-time Updates**: Changes are reflected immediately in the state

### Custom Instructions
- **Optional Field**: Located below the feature toggles
- **Integration**: Custom instructions are appended to the generated prompt
- **Formatting**: Plain text with automatic integration into prompt structure

## Feature Categories & Toggles

### Communication Style
Controls how the AI communicates and interacts with users.

#### Empathy & Friendly Tone Guidelines
- **Purpose**: Instructions for empathetic, friendly communication
- **Benefits**: Builds trust, fosters learning, enhances user experience
- **Trade-offs**: May slow responses if overused in time-critical scenarios
- **Default States**: Enabled for architect, code, debug, ask, orchestrator, technical-writer

#### Clever/Unexpected Jokes
- **Purpose**: Permission to include clever, unexpected humor
- **Benefits**: Adds levity and engagement to interactions
- **Trade-offs**: May dilute professionalism in formal settings
- **Default States**: Enabled for architect, debug, ask

### Process & Planning
Affects how the AI approaches problem-solving and project planning.

#### Holistic View & Hypothetical Consequences
- **Purpose**: Emphasis on comprehensive project understanding and future impact analysis
- **Benefits**: Promotes strategic, proactive thinking and long-term planning
- **Trade-offs**: May increase response complexity
- **Default States**: Enabled for architect, code, debug, ask, orchestrator, technical-writer

#### Numbered Process Steps
- **Purpose**: Structured, step-by-step process documentation
- **Benefits**: Provides clear, repeatable workflows and methodologies
- **Trade-offs**: Adds verbosity to responses
- **Default States**: Enabled for architect, debug, orchestrator, technical-writer

#### Subtask Creation & Delegation
- **Purpose**: Framework for breaking tasks into subtasks and delegating work
- **Benefits**: Enables complex multi-step project coordination
- **Trade-offs**: Increases response length and complexity
- **Default States**: Enabled for architect, debug, orchestrator, technical-writer

### Technical Expertise
Controls technical depth and development best practices adherence.

#### Software Development Best Practices
- **Purpose**: Detailed lists of development principles (SOLID, DRY, etc.) and workflows
- **Benefits**: Ensures high-quality, maintainable code and processes
- **Trade-offs**: May increase learning curve for beginners
- **Default States**: Enabled for architect, code, debug, ask, orchestrator, technical-writer

#### Dev Workflows & Tool Discipline
- **Purpose**: Guidance on version control, environments, CI/CD, and team processes
- **Benefits**: Promotes professional development practices and team collaboration
- **Trade-offs**: Adds overhead for simple projects
- **Default States**: Enabled for architect, code, debug, ask, orchestrator, technical-writer

#### User Education & Explanation Directives
- **Purpose**: Instructions to explain concepts and fill knowledge gaps
- **Benefits**: Enhances learning and understanding for users
- **Trade-offs**: Increases response length and may slow interactions
- **Default States**: Enabled for architect, code, debug, ask, orchestrator, technical-writer

### Tool Integration
Enables integration with external tools and services.

#### Perplexity MCP Instructions
- **Purpose**: Access to Perplexity MCP for research and reasoning tasks
- **Benefits**: Enables advanced research queries and information gathering
- **Trade-offs**: Depends on external service availability
- **Default States**: Enabled for architect, technical-writer

#### Mermaid Diagrams for Clarity
- **Purpose**: Permission to include Mermaid diagrams in responses
- **Benefits**: Visualizes complex workflows and system architectures
- **Trade-offs**: Requires diagram rendering capability in client
- **Default States**: Enabled for architect, ask, orchestrator

## Default Behaviors by Mode

### Cherished Architect
- **Communication Style**: Empathy (✓), Jokes (✓)
- **Process & Planning**: Holistic (✓), Numbered Steps (✓), Subtask Delegation (✓)
- **Technical Expertise**: Best Practices (✓), Dev Workflows (✓), User Education (✓)
- **Tool Integration**: Perplexity (✓), Mermaid (✓)
- **Total Enabled**: 9/9 features

### Cherished Code
- **Communication Style**: Empathy (✓)
- **Process & Planning**: Holistic (✓)
- **Technical Expertise**: Best Practices (✓), Dev Workflows (✓), User Education (✓)
- **Tool Integration**: None
- **Total Enabled**: 5/9 features

### Cherished Debug
- **Communication Style**: Empathy (✓), Jokes (✓)
- **Process & Planning**: Holistic (✓), Numbered Steps (✓), Subtask Delegation (✓)
- **Technical Expertise**: Best Practices (✓), Dev Workflows (✓), User Education (✓)
- **Tool Integration**: None
- **Total Enabled**: 7/9 features

### Cherished Ask
- **Communication Style**: Empathy (✓), Jokes (✓)
- **Process & Planning**: Holistic (✓)
- **Technical Expertise**: Best Practices (✓), Dev Workflows (✓), User Education (✓)
- **Tool Integration**: Mermaid (✓)
- **Total Enabled**: 7/9 features

### Cherished Orchestrator
- **Communication Style**: Empathy (✓)
- **Process & Planning**: Holistic (✓), Numbered Steps (✓), Subtask Delegation (✓)
- **Technical Expertise**: Best Practices (✓), Dev Workflows (✓), User Education (✓)
- **Tool Integration**: Mermaid (✓)
- **Total Enabled**: 8/9 features

### Cherished Technical Writer
- **Communication Style**: None
- **Process & Planning**: Holistic (✓), Numbered Steps (✓), Subtask Delegation (✓)
- **Technical Expertise**: Best Practices (✓), Dev Workflows (✓), User Education (✓)
- **Tool Integration**: Perplexity (✓)
- **Total Enabled**: 7/9 features

### Cherished Simple Code
- **Communication Style**: None
- **Process & Planning**: None
- **Technical Expertise**: None
- **Tool Integration**: None
- **Total Enabled**: 0/9 features

## Technical Details

### TypeScript Interfaces

```typescript
// Core feature types
export type FeatureCategory = {
  id: string;
  name: string;
  description: string;
};

export type FeatureDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultEnabled: Record<string, boolean>;
};

export type FeatureState = Record<string, boolean>;

// Prompt builder state
export interface PromptBuilderState {
  selectedMode: Mode | null;
  customPrompt: string;
  generatedPrompt: string;
  selectedFeatures: FeatureState;
}
```

### Integration Points

#### Mode Context Integration
The feature system integrates with the existing ModeContext through:
- Mode selection triggers default feature state loading
- Feature state persists independently of mode selection
- Generated prompts combine mode templates with feature enhancements

#### State Persistence
- Feature states are stored in component state (not persisted to localStorage)
- Default states are loaded from feature definitions when mode changes
- Custom feature selections persist during session until mode change or reset

#### UI Components
- **Category Sections**: Bordered containers with category name and description headers
- **Feature Checkboxes**: Labeled checkboxes with feature name and description
- **Custom Instructions**: Multi-line textarea for additional requirements
- **Action Buttons**: Generate and reset buttons with emoji indicators
- **Generated Output**: Monospace display area with copy functionality

### Helper Functions

#### Core Utilities
- `getFeaturesByCategory()`: Filters features by category ID
- `getDefaultFeaturesForMode()`: Returns default feature state for a mode slug

#### Data Source
All feature definitions and categories are centralized in `src/data/features.ts` for easy maintenance and updates.

## Implementation Notes

### State Management Strategy
- Feature state is managed locally in PromptBuilder component
- Defaults are loaded from static feature definitions
- State resets when mode changes to ensure clean slate per mode
- No persistence of custom feature combinations (by design)

### Prompt Structure Standards
- Base mode prompt always comes first
- Feature enhancements are grouped under "--- Feature Enhancements ---" section
- Each feature becomes a "## Feature Name" section with its description
- Custom instructions are appended as "Additional Instructions:" section

### Error Handling
- Null checks prevent crashes when mode is unselected
- Feature state defaults to false for unknown features
- Clipboard API failures are logged but don't break functionality

### Performance Considerations
- Feature filtering happens on render (minimal performance impact)
- No expensive computations in render cycle
- State updates are optimized with proper React patterns

## Future Enhancements

### Planned Features (from next.md)
- **Custom Feature Creation**: User-defined features with drag-and-drop ordering
- **Family Filtering**: Only show modes from currently selected families
- **Feature Persistence**: Save custom feature combinations per mode
- **Advanced Prompt Templates**: More sophisticated prompt composition logic
- **Feature Analytics**: Usage statistics and effectiveness tracking

---

*Last updated: 2025-11-02*