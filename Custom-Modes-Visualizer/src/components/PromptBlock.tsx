import React, { useState } from 'react';
import { getFeatureColor, type ColorConfig } from '../utils/colorSystem';

/**
 * Props for the PromptBlock component
 */
interface PromptBlockProps {
  /** Feature ID for color generation */
  featureId: string;
  /** Feature name for display and color */
  featureName: string;
  /** Feature description content */
  featureDescription: string;
  /** Whether this is a custom feature */
  isCustom?: boolean;
  /** Optional custom color override */
  customColor?: ColorConfig;
  /** Click handler */
  onClick?: () => void;
  /** Mouse enter handler for hover effects */
  onMouseEnter?: () => void;
  /** Mouse leave handler for hover effects */
  onMouseLeave?: () => void;
  /** Whether this is in expanded view */
  isExpanded?: boolean;
  /** Layout mode affecting display style */
  mode?: 'compact' | 'grid' | 'virtualized';
}

/**
 * Individual prompt feature block component
 * Renders a colored "Lego block" showing feature name and description
 */
const PromptBlock: React.FC<PromptBlockProps> = ({
  featureId,
  featureName,
  featureDescription,
  isCustom = false,
  customColor,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isExpanded = false,
  mode = 'compact'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get color configuration for this feature
  const colorConfig = customColor || getFeatureColor(featureId, featureName);
  
  // Truncate description for compact view
  const displayDescription = mode === 'compact' 
    ? featureDescription.length > 100 
      ? `${featureDescription.substring(0, 100)}...`
      : featureDescription
    : mode === 'grid'
    ? featureDescription.length > 50
      ? `${featureDescription.substring(0, 50)}...`
      : featureDescription
    : featureDescription.length > 30
    ? `${featureDescription.substring(0, 30)}...`
    : featureDescription;

  // Determine if text should be visible based on mode
  const showDescription = mode === 'compact' || isExpanded || isHovered;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onMouseEnter) {
      onMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  return (
    <div
      className={`
        ${colorConfig.background} ${colorConfig.border} border-2 rounded-lg
        ${colorConfig.shadow} shadow-lg cursor-pointer transition-all duration-300
        ${colorConfig.hover} transform hover:scale-[1.02] hover:-translate-y-1
        ${mode === 'compact' ? 'p-4' : mode === 'grid' ? 'p-3' : 'p-2'}
        ${isHovered ? 'ring-2 ring-gray-300' : ''}
        group relative overflow-hidden
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Custom badge for custom features */}
      {isCustom && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-white bg-opacity-90 text-purple-700 text-xs font-bold px-2 py-1 rounded-full border border-purple-200">
            Custom
          </span>
        </div>
      )}

      {/* Feature name */}
      <div className={`font-semibold ${colorConfig.text} mb-2 ${mode === 'compact' ? 'text-sm' : 'text-xs'}`}>
        {featureName}
      </div>

      {/* Feature description */}
      {showDescription && (
        <div className={`${colorConfig.text} opacity-90 transition-all duration-300 ${mode === 'compact' ? 'text-sm' : 'text-xs'}`}>
          {isExpanded && mode !== 'compact' ? featureDescription : displayDescription}
        </div>
      )}

      {/* Hover effect overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0
        transition-opacity duration-300 pointer-events-none
        ${isHovered ? 'opacity-20' : ''}
      `} />

      {/* Lego-like stud pattern on top edge */}
      <div className="absolute top-0 left-0 right-0 flex justify-around py-1">
        {Array.from({ length: mode === 'compact' ? 6 : 4 }).map((_, i) => (
          <div 
            key={i}
            className={`
              bg-white bg-opacity-40 rounded-full
              ${mode === 'compact' ? 'w-2 h-2' : 'w-1 h-1'}
            `}
          />
        ))}
      </div>

      {/* Tooltip for mobile/quick info */}
      <div className={`
        absolute bottom-2 right-2 ${colorConfig.text} opacity-0 group-hover:opacity-70 
        transition-opacity duration-200 text-xs
      `}>
        {mode !== 'compact' && 'Tap for details'}
      </div>
    </div>
  );
};

export default PromptBlock;