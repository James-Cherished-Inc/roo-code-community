import type { FeatureDefinition, FeatureCategory, FeatureState } from '../types';

/**
 * Feature categories for organizing toggleable features
 */
export const featureCategories: FeatureCategory[] = [
  {
    id: 'communication-style',
    name: 'Communication Style',
    description: 'Features that control how the AI communicates and interacts',
  },
  {
    id: 'process-planning',
    name: 'Process & Planning',
    description: 'Features that affect how the AI approaches problem-solving and planning',
  },
  {
    id: 'technical-expertise',
    name: 'Technical Expertise',
    description: 'Features that control technical depth and best practices adherence',
  },
  {
    id: 'tool-integration',
    name: 'Tool Integration',
    description: 'Features that enable or disable integration with external tools and services',
  },
];

/**
 * Toggleable features with their definitions and default states per mode
 */
export const features: FeatureDefinition[] = [
  // Communication Style features
  {
    id: 'empathyFriendlyTone',
    name: 'Empathy & Friendly Tone Guidelines',
    description: 'Instructions to "be empathetic," "friendly," or "engaging" while explaining decisions and reasoning. Includes phrases like "bring readers at your level of skill and understanding." This fosters trust and learning but can slow responses if overused.',
    category: 'communication-style',
    defaultEnabled: {
      'cherished-architect': true, // planning needs rapport
      'cherished-code': true,
      'cherished-debug': true,
      'cherished-ask': true, // mentorship
      'cherished-orchestrator': true, // coordination
      'cherished-technical-writer': false, // factual focus
      'cherished-simple-code': false, // speed
    },
  },
  {
    id: 'cleverJokes',
    name: 'Clever/Unexpected Jokes',
    description: 'Directive to include "clever and unexpected jokes when you have the occasion." Adds levity but risks diluting professionalism in formal settings.',
    category: 'communication-style',
    defaultEnabled: {
      'cherished-architect': true,
      'cherished-code': false,
      'cherished-debug': true, // relief during troubleshooting
      'cherished-ask': true, // mentorship engagement
      'cherished-orchestrator': false,
      'cherished-technical-writer': false, // serious docs
      'cherished-simple-code': false,
    },
  },

  // Process & Planning features
  {
    id: 'holisticView',
    name: 'Holistic View & Hypothetical Consequences',
    description: 'Emphasis on "holistic view of the project," "hypothetical consequences of each possible next move," and "long-term health and success." Promotes proactive, strategic thinking.',
    category: 'process-planning',
    defaultEnabled: {
      'cherished-architect': true, // core to planning
      'cherished-code': true,
      'cherished-debug': true,
      'cherished-ask': true,
      'cherished-orchestrator': true, // high-level coordination
      'cherished-technical-writer': true,
      'cherished-simple-code': false,
    },
  },
  {
    id: 'numberedSteps',
    name: 'Numbered Process Steps',
    description: 'Step-by-step processes (e.g., architect\'s 10-step process, debug\'s 4-step analysis, code\'s pre-edit gathering). Provides clear, repeatable workflows.',
    category: 'process-planning',
    defaultEnabled: {
      'cherished-architect': true, // planning-intensive
      'cherished-code': false,
      'cherished-debug': true, // systematic
      'cherished-ask': false,
      'cherished-orchestrator': true, // multi-step
      'cherished-technical-writer': true,
      'cherished-simple-code': false,
    },
  },
  {
    id: 'subtaskDelegation',
    name: 'Subtask Creation & Delegation',
    description: 'Instructions on using new_task tool, choosing modes, providing context, and signaling completion. Includes scope definitions and result summaries.',
    category: 'process-planning',
    defaultEnabled: {
      'cherished-architect': true, // when planning heavy tasks
      'cherished-code': false,
      'cherished-debug': true,
      'cherished-ask': false,
      'cherished-orchestrator': true, // core to delegation
      'cherished-technical-writer': true,
      'cherished-simple-code': false,
    },
  },

  // Technical Expertise features
  {
    id: 'bestPractices',
    name: 'Software Development Best Practices Sections',
    description: 'Detailed lists of principles (e.g., SRP, DIP, modularity, dependency discipline) and workflows (e.g., small batches, reviews, ESLint). Ensures high-quality code.',
    category: 'technical-expertise',
    defaultEnabled: {
      'cherished-architect': true,
      'cherished-code': true, // implementation
      'cherished-debug': true,
      'cherished-ask': true,
      'cherished-orchestrator': true,
      'cherished-technical-writer': true,
      'cherished-simple-code': false,
    },
  },
  {
    id: 'devWorkflows',
    name: 'Dev Workflows & Tool Discipline',
    description: 'Guidance on git management, virtual environments, dependency tracking, periodic reviews, and CI standardization. Promotes maintainable projects.',
    category: 'technical-expertise',
    defaultEnabled: {
      'cherished-architect': true,
      'cherished-code': true, // commit discipline
      'cherished-debug': true,
      'cherished-ask': true,
      'cherished-orchestrator': true,
      'cherished-technical-writer': true, // doc hygiene
      'cherished-simple-code': false,
    },
  },
  {
    id: 'userEducation',
    name: 'User Education & Explanation Directives',
    description: 'Prompts to "explain the why," teach tips, fill knowledge gaps, and break down concepts (e.g., "bring technical and non-technical profiles to your level"). Enhances learning but increases verbosity.',
    category: 'technical-expertise',
    defaultEnabled: {
      'cherished-architect': true,
      'cherished-code': true,
      'cherished-debug': true, // teaching during fixes
      'cherished-ask': true, // mentorship core
      'cherished-orchestrator': true,
      'cherished-technical-writer': true,
      'cherished-simple-code': false,
    },
  },

  // Tool Integration features
  {
    id: 'perplexityMcp',
    name: 'Perplexity MCP Instructions',
    description: 'Access to Perplexity MCP for research, reasoning, or searching (e.g., "use Perplexity MCP for deep AI research"). Enables advanced queries.',
    category: 'tool-integration',
    defaultEnabled: {
      'cherished-architect': true, // planning research
      'cherished-code': false,
      'cherished-debug': false, // optional
      'cherished-ask': false, // optional
      'cherished-orchestrator': false,
      'cherished-technical-writer': true,
      'cherished-simple-code': false,
    },
  },
  {
    id: 'mermaidDiagrams',
    name: 'Mermaid Diagrams for Clarity',
    description: 'Permission to include Mermaid diagrams in responses, with formatting notes (e.g., avoid quotes/parentheses in brackets). Visualizes workflows.',
    category: 'tool-integration',
    defaultEnabled: {
      'cherished-architect': true, // system design
      'cherished-code': false,
      'cherished-debug': false,
      'cherished-ask': true,
      'cherished-orchestrator': true, // workflows
      'cherished-technical-writer': false,
      'cherished-simple-code': false,
    },
  },
];

/**
 * Helper function to get features by category
 */
export const getFeaturesByCategory = (categoryId: string): FeatureDefinition[] => {
  return features.filter(feature => feature.category === categoryId);
};

/**
 * Helper function to get default feature state for a mode
 */
export const getDefaultFeaturesForMode = (modeSlug: string): FeatureState => {
  const state: FeatureState = {};
  features.forEach(feature => {
    state[feature.id] = feature.defaultEnabled[modeSlug] ?? false;
  });
  return state;
};