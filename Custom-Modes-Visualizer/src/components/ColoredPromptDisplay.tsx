import React, { useState, useMemo, useCallback } from 'react';
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
  /** Actual base mode prompt text - the real content contribution */
  baseModePrompt?: string;
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
  baseModePrompt,
  customInstructions
}) => {
  const [showRawText, setShowRawText] = useState(false);

  /**
   * Extract base mode content from prompt text
    * Returns the actual base mode prompt text contribution
    */
   const extractBaseModeContent = useCallback((text: string): string => {
     // Priority 1: Use the actual base mode prompt if provided
     if (baseModePrompt) {
       return baseModePrompt;
     }

     // Priority 2: Extract from generated prompt text
     const featureSectionIndex = text.indexOf('--- Feature Enhancements ---');
     if (featureSectionIndex !== -1) {
       return text.substring(0, featureSectionIndex).trim();
     }

     // Fallback: Use entire text if no sections found
     return text.trim();
   }, [baseModePrompt]);

  /**
   * Extract custom instructions content from prompt text
    * Returns the actual custom instructions text contribution
    */
   const extractCustomContent = useCallback((text: string): string => {
     // Priority 1: Use the actual custom instructions if provided
     if (customInstructions) {
       return customInstructions;
     }

     // Priority 2: Extract from generated prompt text
     const customSectionIndex = text.indexOf('Additional Instructions:');
     if (customSectionIndex !== -1) {
       return text.substring(customSectionIndex + 'Additional Instructions:'.length).trim();
     }
     return '';
   }, [customInstructions]);

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
      const baseContent = extractBaseModeContent(promptText);
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

    // 2. Add feature blocks in order - show actual prompt content added
    enabledFeatures.forEach((feature, index) => {
      // Show the complete prompt format: "## Feature Name\nDescription"
      const featureContent = `## ${feature.name}\n${feature.description}`;
      if (featureContent && featureContent.trim()) {
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
  }, [promptText, enabledFeatures, baseModeName, customInstructions, baseModePrompt, extractBaseModeContent, extractCustomContent]);

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