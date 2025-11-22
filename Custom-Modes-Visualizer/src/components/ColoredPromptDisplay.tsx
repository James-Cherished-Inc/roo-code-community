import React, { useState, useMemo } from 'react';
import { getFeatureColor } from '../utils/colorSystem';
import type { FeatureDefinition } from '../types';

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
 * Represents a parsed segment of the prompt text
 */
interface PromptSegment {
  text: string;
  type: 'base' | 'feature' | 'custom' | 'unmatched';
  featureId?: string;
  featureName?: string;
}

/**
 * Colored prompt display component with inline text highlighting
 * Parses generated prompt to identify feature contributions and applies colored highlighting
 */
const ColoredPromptDisplay: React.FC<ColoredPromptDisplayProps> = ({
  enabledFeatures,
  promptText,
  baseModeName,
  customInstructions
}) => {
  const [showRawText, setShowRawText] = useState(false);

  // Parse prompt text into segments based on feature keywords and patterns
  const parsedSegments = useMemo((): PromptSegment[] => {
    if (!enabledFeatures.length) {
      return [{ text: promptText || 'No prompt generated yet.', type: 'unmatched' }];
    }

    const segments: PromptSegment[] = [];
    let remainingText = promptText || '';
    
    // Sort features by priority (more specific descriptions first)
    const sortedFeatures = [...enabledFeatures].sort((a, b) =>
      b.description.length - a.description.length
    );

    for (const feature of sortedFeatures) {
      const featureKeywords = extractKeywords(feature);
      const match = findBestMatch(remainingText, featureKeywords);
      
      if (match.found && match.index >= 0 && match.length > 0) {
        // Add text before the match
        if (match.index > 0) {
          segments.push({
            text: remainingText.substring(0, match.index),
            type: 'unmatched'
          });
        }
        
        // Add the matched feature text
        segments.push({
          text: remainingText.substring(match.index, match.index + match.length),
          type: 'feature',
          featureId: feature.id,
          featureName: feature.name
        });
        
        // Update remaining text
        remainingText = remainingText.substring(match.index + match.length);
      }
    }
    
    // Add any remaining text
    if (remainingText) {
      segments.push({
        text: remainingText,
        type: remainingText.trim() ? 'unmatched' : 'base'
      });
    }

    // If no segments were found, treat entire text as base
    if (segments.length === 0) {
      return [{ text: promptText || '', type: 'base' }];
    }

    return segments;
  }, [promptText, enabledFeatures]);

  // Extract meaningful keywords from feature description
  const extractKeywords = (feature: FeatureDefinition): string[] => {
    const text = `${feature.name} ${feature.description}`.toLowerCase();
    // Remove common words and extract meaningful terms
    const words = text.split(/\s+/).filter(word => 
      word.length > 3 && 
      !['with', 'that', 'this', 'from', 'have', 'will', 'should', 'could', 'would'].includes(word)
    );
    return words.slice(0, 10); // Limit to top 10 keywords
  };

  // Find best matching text segment for feature keywords
  const findBestMatch = (text: string, keywords: string[]): { found: boolean; index: number; length: number } => {
    if (!text || !keywords.length) return { found: false, index: -1, length: 0 };

    let bestMatch = { found: false, index: -1, length: 0 };
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const match = regex.exec(text);
      
      if (match) {
        const keywordLength = match[0].length;
        if (keywordLength > bestMatch.length) {
          bestMatch = { found: true, index: match.index, length: keywordLength };
        }
      }
    }

    // If no keyword match, try to match feature name
    if (!bestMatch.found) {
      for (const feature of enabledFeatures) {
        const featureNameRegex = new RegExp(`\\b${feature.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const match = featureNameRegex.exec(text);
        if (match) {
          bestMatch = { found: true, index: match.index, length: match[0].length };
          break;
        }
      }
    }

    return bestMatch;
  };

  // Render a colored text segment
  const renderColoredSegment = (segment: PromptSegment, index: number) => {
    if (segment.type === 'unmatched') {
      return (
        <span key={index} className="text-gray-800">
          {segment.text}
        </span>
      );
    }

    if (segment.type === 'base') {
      return (
        <span key={index} className="font-semibold text-blue-800 bg-blue-50 px-1 rounded">
          {segment.text}
        </span>
      );
    }

    if (segment.type === 'feature' && segment.featureId && segment.featureName) {
      const colorConfig = getFeatureColor(segment.featureId, segment.featureName);
      
      return (
        <span
          key={index}
          className={`${colorConfig.background} ${colorConfig.text} px-1 py-0.5 rounded border-l-2 ${colorConfig.border} inline-block`}
          title={`${segment.featureName} feature contribution`}
        >
          {segment.text}
        </span>
      );
    }

    return (
      <span key={index} className="text-gray-800">
        {segment.text}
      </span>
    );
  };

  // Build summary text
  const buildSummary = () => {
    const features = enabledFeatures.map(f => f.name);
    const baseMode = baseModeName ? `base mode + ${baseModeName}` : 'base mode';
    const allFeatures = [baseMode, ...features].join(', ');
    return `Built with: ${allFeatures}`;
  };

  // Render raw prompt text
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
        <h3 className="text-lg font-medium text-gray-900">Generated Prompt Structure</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            {showRawText ? 'Show Colored' : 'Show Raw'}
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
          <div className="prose prose-sm max-w-none">
            <div className="text-sm leading-relaxed text-gray-800">
              {parsedSegments.map((segment, index) => renderColoredSegment(segment, index))}
            </div>
          </div>
        )}
      </div>

      {/* Base mode section */}
      {baseModeName && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🎯</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Base Mode: {baseModeName}</h4>
              <p className="text-blue-700 text-sm">Foundation prompt template</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom instructions section */}
      {customInstructions && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">✨</span>
            </div>
            <div>
              <h4 className="font-semibold text-purple-900">Custom Instructions</h4>
              <p className="text-purple-700 text-sm">Additional custom requirements</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white bg-opacity-70 rounded border border-purple-200">
            <p className="text-gray-800 text-sm">{customInstructions}</p>
          </div>
        </div>
      )}

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
        <p>✨ Intelligent text parsing identifies feature contributions automatically</p>
        <p>💡 Toggle between colored and raw text for different views</p>
      </div>
    </div>
  );
};

export default ColoredPromptDisplay;