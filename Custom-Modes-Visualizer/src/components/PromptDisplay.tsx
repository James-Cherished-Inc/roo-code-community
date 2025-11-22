import React, { useState, useMemo } from 'react';
import { getDisplayMode, getLayoutConfig } from '../utils/colorSystem';
import PromptBlock from './PromptBlock';
import type { FeatureDefinition } from '../types';

/**
 * Props for the PromptDisplay component
 */
interface PromptDisplayProps {
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
 * Main prompt display component with Lego-style visual blocks
 * Handles different layout modes based on number of features
 */
const PromptDisplay: React.FC<PromptDisplayProps> = ({
  enabledFeatures,
  baseModeName,
  customInstructions
}) => {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  // Determine display mode based on feature count
  const displayMode = useMemo(() => getDisplayMode(enabledFeatures.length), [enabledFeatures.length]);
  const layoutConfig = useMemo(() => getLayoutConfig(displayMode), [displayMode]);

  // Calculate feature order for display
  const featureOrder = useMemo(() => {
    return enabledFeatures.map(feature => ({
      ...feature,
      order: feature.id.charCodeAt(0) + (feature.category === 'communication-style' ? 0 : 100)
    })).sort((a, b) => a.order - b.order);
  }, [enabledFeatures]);

  // Render individual block
  const renderPromptBlock = (feature: FeatureDefinition) => {
    const isExpanded = expandedBlock === feature.id;

    return (
      <div key={feature.id} className="mb-3">
        <PromptBlock
          featureId={feature.id}
          featureName={feature.name}
          featureDescription={feature.description}
          isCustom={!feature.hasOwnProperty('defaultEnabled')} // Heuristic for custom vs built-in
          isExpanded={isExpanded}
          onClick={() => setExpandedBlock(isExpanded ? null : feature.id)}
        />
      </div>
    );
  };

  // Compact layout: vertical stack with full descriptions
  const renderCompactLayout = () => (
    <div className={`space-y-3 ${layoutConfig.maxHeight} ${layoutConfig.overflow}`}>
      {featureOrder.map(feature => renderPromptBlock(feature))}
    </div>
  );

  // Grid layout: 2-3 columns for medium numbers
  const renderGridLayout = () => {
    const columns = window.innerWidth >= 1024 ? 3 : 2;
    
    return (
      <div className={`grid gap-2 ${layoutConfig.maxHeight} ${layoutConfig.overflow}`} 
           style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {featureOrder.map(feature => (
          <div key={feature.id}>
            {renderPromptBlock(feature)}
          </div>
        ))}
      </div>
    );
  };

  // Scrollable layout: for large numbers of features
  const renderScrollableLayout = () => (
    <div className={`${layoutConfig.maxHeight} ${layoutConfig.overflow} border rounded-lg bg-gray-50 p-4`}>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {featureOrder.map(feature => (
          <div key={feature.id}>
            {renderPromptBlock(feature)}
          </div>
        ))}
      </div>
    </div>
  );

  // Render copy prompt text in a more visible area when no features
  const renderEmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      <div className="text-4xl mb-4">🧱</div>
      <p className="text-lg font-medium mb-2">No Features Selected</p>
      <p className="text-sm">Choose some features above to build your colorful prompt blocks!</p>
    </div>
  );

  // Main render
  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Generated Prompt Structure</h3>
        <div className="text-sm text-gray-600">
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {enabledFeatures.length} feature{enabledFeatures.length !== 1 ? 's' : ''}
          </span>
        </div>
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

      {/* Features blocks */}
      <div className="min-h-[200px]">
        {enabledFeatures.length === 0 ? (
          renderEmptyState()
        ) : displayMode === 'compact' ? (
          renderCompactLayout()
        ) : displayMode === 'grid' ? (
          renderGridLayout()
        ) : (
          renderScrollableLayout()
        )}
      </div>

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

      {/* Expanded feature details overlay */}
      {expandedBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-96 overflow-y-auto p-6">
            {(() => {
              const feature = featureOrder.find(f => f.id === expandedBlock);
              if (!feature) return null;
              
              return (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{feature.name}</h3>
                    <button
                      onClick={() => setExpandedBlock(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="prose prose-sm">
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Legend for layout modes */}
      <div className="text-xs text-gray-500 text-center border-t pt-4">
        <p>Layout: {displayMode === 'compact' ? 'Detailed Stack' : displayMode === 'grid' ? 'Grid View' : 'Scrollable Grid'}</p>
        {enabledFeatures.length > 50 && (
          <p className="mt-1">📋 Large feature set - scrollable grid for performance</p>
        )}
      </div>
    </div>
  );
};

export default PromptDisplay;