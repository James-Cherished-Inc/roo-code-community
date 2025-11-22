import * as React from 'react';
import { getFeatureColor, type ColorConfig } from '../utils/colorSystem';

/**
 * Block data structure for Lego-style prompt display
 */
export interface DisplayPromptBlock {
  id: string;
  type: 'base' | 'feature' | 'custom';
  title: string;
  content: string;
  colorConfig: ColorConfig;
  featureId?: string;
  featureName?: string;
}

/**
 * Props for the PromptDisplayBlock component
 */
interface PromptDisplayBlockProps {
  /** Block data to display */
  block: DisplayPromptBlock;
  /** Whether this block is expanded to show full content */
  isExpanded?: boolean;
  /** Whether to show truncated content (for compact view) */
  isCompact?: boolean;
  /** Whether to show the Lego stud pattern on top */
  showStuds?: boolean;
  /** CSS class overrides */
  className?: string;
}

/**
 * Get color configuration for different block types
 */
const getBlockColorConfig = (
  type: 'base' | 'feature' | 'custom',
  featureId?: string,
  featureName?: string
): ColorConfig => {
  // Base blocks use blue variants
  if (type === 'base') {
    return {
      background: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-900',
      hover: 'hover:from-blue-100 hover:to-blue-200',
      shadow: 'shadow-blue-200'
    };
  }

  // Custom instruction blocks use purple variants
  if (type === 'custom') {
    return {
      background: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-900',
      hover: 'hover:from-purple-100 hover:to-purple-200',
      shadow: 'shadow-purple-200'
    };
  }

  // Feature blocks use the existing color system
  if (featureId && featureName) {
    return getFeatureColor(featureId, featureName);
  }

  // Fallback for feature blocks without proper identifiers
  return {
    background: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-900',
    hover: 'hover:bg-gray-100',
    shadow: 'shadow-gray-200'
  };
};

/**
 * Get display icon for block type
 */
const getBlockIcon = (type: 'base' | 'feature' | 'custom'): string => {
  switch (type) {
    case 'base':
      return '🎯';
    case 'feature':
      return '⚡';
    case 'custom':
      return '✨';
    default:
      return '📄';
  }
};

/**
 * Individual Lego-style prompt display block
 * Renders as a discrete, stacked colored block resembling Lego pieces
 */
const PromptDisplayBlock: React.FC<PromptDisplayBlockProps> = ({
  block,
  isExpanded = false,
  isCompact = false,
  showStuds = true,
  className = ''
}) => {
  const colorConfig = block.colorConfig || getBlockColorConfig(block.type, block.featureId, block.featureName);
  const icon = getBlockIcon(block.type);

  // Truncate content for compact view unless expanded
  const displayContent = isExpanded || !isCompact
    ? block.content
    : block.content.length > 200
    ? `${block.content.substring(0, 200)}...`
    : block.content;

  // Determine block size based on content and compact setting
  const sizeClasses = isCompact
    ? 'p-3 text-sm'
    : 'p-4 text-base';

  // Typography classes for title and content
  const titleClasses = isCompact ? 'text-sm font-semibold' : 'text-base font-semibold';
  const contentClasses = isCompact ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed';

  return (
    <div
      className={`
        ${colorConfig.background} ${colorConfig.border} 
        border-2 rounded-xl shadow-lg 
        ${colorConfig.hover} transition-all duration-300 
        transform hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-xl
        ${sizeClasses} ${className}
        relative overflow-hidden group
        min-h-fit
      `}
      title={`${block.title} block`}
    >
      {/* Lego stud pattern on top edge */}
      {showStuds && (
        <div className="absolute top-1 left-0 right-0 flex justify-around">
          {Array.from({ length: isCompact ? 4 : 6 }).map((_, i) => (
            <div
              key={i}
              className={`
                bg-white bg-opacity-40 rounded-full
                ${isCompact ? 'w-1.5 h-1.5' : 'w-2 h-2'}
                shadow-sm
              `}
            />
          ))}
        </div>
      )}

      {/* Block header with icon and title */}
      <div className="flex items-start space-x-3 mb-3 mt-1">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${colorConfig.text.replace('text-', 'bg-').replace('-900', '-200')}
          text-lg flex-shrink-0
        `}>
          <span className="select-none">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`${colorConfig.text} ${titleClasses} mb-1`}>
            {block.title}
          </h4>
          <div className={`
            ${colorConfig.text} opacity-70 text-xs font-medium
            ${isCompact ? 'uppercase tracking-wide' : 'capitalize'}
          `}>
            {block.type === 'feature' && block.featureName && (
              <span className="mr-2">• {block.featureName}</span>
            )}
            {block.type === 'base' && 'Foundation'}
            {block.type === 'custom' && 'Additional Instructions'}
          </div>
        </div>
      </div>

      {/* Block content */}
      <div className={`
        ${colorConfig.text} ${contentClasses}
        bg-white bg-opacity-30 rounded-lg p-3 
        border border-white border-opacity-20
        ${isCompact ? 'max-h-32 overflow-y-auto' : 'max-h-none'}
        font-medium
      `}>
        <pre className="whitespace-pre-wrap font-sans">
          {displayContent}
        </pre>
      </div>

      {/* Hover effect overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0
        transition-opacity duration-300 pointer-events-none
        ${colorConfig.hover.includes('hover:from-') ? 'group-hover:opacity-10' : 'group-hover:opacity-5'}
      `} />

      {/* Type indicator */}
      <div className={`
        absolute bottom-2 right-2 
        ${colorConfig.text} opacity-40 group-hover:opacity-60
        transition-opacity duration-200 text-xs font-bold
        ${isCompact ? 'px-2 py-1' : 'px-2 py-1'}
        bg-white bg-opacity-20 rounded-full
        ${isCompact ? 'text-xs' : 'text-xs'}
      `}>
        {block.type.toUpperCase()}
      </div>

      {/* Content length indicator for truncated content */}
      {isCompact && block.content.length > 200 && (
        <div className={`
          absolute top-2 right-2
          ${colorConfig.text} opacity-0 group-hover:opacity-100
          transition-opacity duration-200 text-xs
          bg-white bg-opacity-80 rounded px-2 py-1
        `}>
          {block.content.length} chars
        </div>
      )}
    </div>
  );
};

export default PromptDisplayBlock;