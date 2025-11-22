import React, { useState, useMemo } from 'react';
import { getFeatureColor } from '../utils/colorSystem';
import type { FeatureDefinition } from '../types';
import PromptDisplayBlock, { type DisplayPromptBlock } from './PromptDisplayBlock';

/**
 * Props for the ColoredPromptDisplay component
 */
interface ColoredPromptDisplayProps {
  /** Array of enabled features to display */
  enabledFeatures: FeatureDefinition[];
  /** Generated prompt text */
  promptText: string;
  /** Base mode name */
  baseModeName: string;
  /** Custom instructions text */
  customInstructions?: string;
}

/**
 * Colored prompt display component with discrete block rendering
 * Uses structured blocks to represent prompt components (base mode, features, custom instructions)
 */
const ColoredPromptDisplay: React.FC<ColoredPromptDisplayProps> = ({
  enabledFeatures,
  promptText,
  baseModeName,
  customInstructions
}) => {
  const [showRawText, setShowRawText] = useState(false);

  /**
   * Extract base mode content from prompt text
   * Returns a short summary instead of full prompt text
   */
  const extractBaseModeContent = (text: string, baseModeName: string): string => {
    const featureSectionIndex = text.indexOf('--- Feature Enhancements ---');
    let baseContent = '';
    
    if (featureSectionIndex !== -1) {
      baseContent = text.substring(0, featureSectionIndex).trim();
    } else {
      // If no feature enhancements section, treat entire text as base mode
      baseContent = text.trim();
    }
    
    // If content is short enough, return as is
    if (baseContent.length <= 150) {
      return baseContent;
    }
    
    // Create a short summary based on the base mode name
    const modeSummary = getBaseModeSummary(baseModeName);
    return modeSummary || baseContent.substring(0, 147) + '...';
  };

  /**
   * Get a short summary for base modes
   */
  const getBaseModeSummary = (baseModeName: string): string => {
    const summaries: { [key: string]: string } = {
      'Code Specialist': 'Expert software engineer with modern programming knowledge, providing smart, clean, and efficient code solutions.',
      'Data Scientist': 'Advanced analytics expert specializing in machine learning, statistical analysis, and data-driven insights.',
      'Product Manager': 'Strategic product leader focused on user needs, market analysis, and product development best practices.',
      'UI/UX Designer': 'Creative design professional specializing in user experience, interface design, and user research.',
      'Business Analyst': 'Strategic business expert focused on process optimization, requirements analysis, and data-driven decisions.'
    };
    
    return summaries[baseModeName] || `${baseModeName} mode focused on specialized expertise and best practices.`;
  };

  /**
   * Shorten text to specified character limit while preserving sentence boundaries
   */
  const shortenText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    
    // Find the last complete sentence within the limit
    const sentences = text.split(/[.!?]+/);
    let result = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      const sentenceWithPunctuation = trimmedSentence + '.';
      if (result.length + sentenceWithPunctuation.length <= maxLength) {
        result += (result ? ' ' : '') + sentenceWithPunctuation;
      } else {
        break;
      }
    }
    
    // If we couldn't fit any complete sentences, truncate at word boundary
    if (!result) {
      const truncated = text.substring(0, maxLength - 3);
      const lastSpaceIndex = truncated.lastIndexOf(' ');
      return lastSpaceIndex > maxLength * 0.8
        ? truncated.substring(0, lastSpaceIndex) + '...'
        : truncated + '...';
    }
    
    return result;
  };

  /**
   * Extract feature content from prompt text
   * Returns shortened feature descriptions (2-3 sentences max)
   */
  const extractFeatureContent = (text: string, _featureId: string, featureName: string): string => {
    const featureSectionIndex = text.indexOf('--- Feature Enhancements ---');
    if (featureSectionIndex === -1) {
      return '';
    }

    const featureSection = text.substring(featureSectionIndex);
    // Look for feature section between ## headers
    const featureHeaderRegex = new RegExp(`##\\s*${featureName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n([\\s\\S]*?)(?=##|---|$)`, 'i');
    const match = featureSection.match(featureHeaderRegex);
    
    if (match && match[1]) {
      const fullContent = match[1].trim();
      return shortenText(fullContent, 200); // Limit to ~200 characters
    }

    // Fallback: try to find content after the feature name in any section
    const lines = featureSection.split('\n');
    let foundFeature = false;
    const contentLines: string[] = [];
    
    for (const line of lines) {
      if (line.trim().startsWith(`## ${featureName}`)) {
        foundFeature = true;
        continue;
      }
      if (foundFeature && line.trim().startsWith('##')) {
        // Found next feature, stop collecting
        break;
      }
      if (foundFeature && line.trim()) {
        contentLines.push(line);
      }
    }
    
    const fallbackContent = contentLines.join('\n').trim();
    return shortenText(fallbackContent, 200);
  };

  /**
   * Extract custom instructions content from prompt text
   * Looks for "Additional Instructions:" section
   */
  const extractCustomContent = (text: string): string => {
    const customSectionIndex = text.indexOf('Additional Instructions:');
    if (customSectionIndex !== -1) {
      return text.substring(customSectionIndex + 'Additional Instructions:'.length).trim();
    }
    return '';
  };

  /**
   * Create structured blocks from prompt data
   * Follows proper data flow: Base mode → Features (in drag-drop order) → Custom instructions
   */
  const promptBlocks = useMemo((): DisplayPromptBlock[] => {
    if (!promptText) {
      return [];
    }

    const blocks: DisplayPromptBlock[] = [];

    // 1. Add base mode block
    if (baseModeName) {
      const baseContent = extractBaseModeContent(promptText, baseModeName);
      if (baseContent) {
        const baseBlock: DisplayPromptBlock = {
          id: `base-${Date.now()}`,
          type: 'base',
          title: 'Base Mode',
          content: baseContent,
          colorConfig: getFeatureColor('base', baseModeName),
          featureId: 'base',
          featureName: baseModeName
        };
        blocks.push(baseBlock);
      }
    }

    // 2. Add feature blocks in order
    enabledFeatures.forEach((feature, index) => {
      const featureContent = extractFeatureContent(promptText, feature.id, feature.name);
      if (featureContent) {
        const featureBlock: DisplayPromptBlock = {
          id: `feature-${feature.id}-${Date.now()}-${index}`,
          type: 'feature',
          title: feature.name,
          content: featureContent,
          colorConfig: getFeatureColor(feature.id, feature.name),
          featureId: feature.id,
          featureName: feature.name
        };
        blocks.push(featureBlock);
      }
    });

    // 3. Add custom instructions block
    if (customInstructions) {
      const customContent = extractCustomContent(promptText) || customInstructions;
      if (customContent) {
        const customBlock: DisplayPromptBlock = {
          id: `custom-${Date.now()}`,
          type: 'custom',
          title: 'Custom Instructions',
          content: customContent,
          colorConfig: getFeatureColor('custom', 'Custom Instructions'),
          featureId: 'custom',
          featureName: 'Custom Instructions'
        };
        blocks.push(customBlock);
      }
    }

    return blocks;
  }, [promptText, enabledFeatures, baseModeName, customInstructions]);

  /**
   * Build summary text for the display
   */
  const buildSummary = () => {
    const features = enabledFeatures.map(f => f.name);
    const baseMode = baseModeName ? `base mode + ${baseModeName}` : 'base mode';
    const allFeatures = [baseMode, ...features].join(', ');
    return `Built with: ${allFeatures}`;
  };

  /**
   * Render raw prompt text
   */
  const renderRawText = () => (
    <div className="bg-gray-50 border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-700">Raw Prompt Text</h4>
        <button
          onClick={() => navigator.clipboard.writeText(promptText)}
          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
        >
          Copy
        </button>
      </div>
      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
        {promptText || 'No prompt generated yet.'}
      </pre>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Lego-Style Prompt Structure</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            {showRawText ? 'Show Blocks' : 'Show Raw'}
          </button>
          <div className="text-sm text-gray-600">
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {enabledFeatures.length} feature{enabledFeatures.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Summary info */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">📋</span>
          <span>{buildSummary()}</span>
        </div>
      </div>

      {/* Prompt content */}
      <div className="bg-white border rounded-lg p-6">
        {showRawText ? (
          renderRawText()
        ) : (
          <div className="space-y-4">
            {promptBlocks.length > 0 ? (
              promptBlocks.map((block, index) => (
                <div key={block.id} className="relative">
                  {/* Connection line to next block (except last) */}
                  {index < promptBlocks.length - 1 && (
                    <div className="absolute -bottom-2 left-8 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent z-10" />
                  )}
                  <PromptDisplayBlock
                    block={block}
                    isCompact={false}
                    showStuds={true}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">🧱</div>
                <p>No prompt blocks to display. Generate a prompt to see the Lego-style structure.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature legend */}
      {enabledFeatures.length > 0 && !showRawText && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Feature Color Legend</h4>
          <div className="flex flex-wrap gap-2">
            {enabledFeatures.map(feature => {
              const colorConfig = getFeatureColor(feature.id, feature.name);
              return (
                <div
                  key={feature.id}
                  className={`${colorConfig.background} ${colorConfig.text} px-2 py-1 rounded border ${colorConfig.border} text-xs`}
                >
                  {feature.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis info */}
      <div className="text-xs text-gray-500 text-center border-t pt-4">
        <p>🧱 Discrete blocks represent prompt components for clear visualization</p>
        <p>⚡ Features are displayed in drag-drop order for easy understanding</p>
        <p>💡 Toggle between block view and raw text for different perspectives</p>
      </div>
    </div>
  );
};

export default ColoredPromptDisplay;