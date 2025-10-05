import React, { useState, useMemo, useRef, useEffect } from 'react';
import { analyzeRedundancies, type RedundancyConfig } from '../utils/redundancyAnalysis';

/**
 * Props for the RedundancyHighlighter component
 */
interface RedundancyHighlighterProps {
  /** Array of prompts to analyze */
  prompts: Array<{ content: string; id: string; name?: string }>;
  /** Custom configuration for redundancy analysis */
  config?: RedundancyConfig;
  /** Whether to show individual prompt names (default: false) */
  showPromptNames?: boolean;
  /** Custom CSS class for the container */
  className?: string;
}

/**
 * Component that highlights redundant words across multiple prompts
 */
const RedundancyHighlighter: React.FC<RedundancyHighlighterProps> = ({
  prompts,
  config,
  showPromptNames = false,
  className = ""
}) => {
  const [showRedundancies, setShowRedundancies] = useState(false);
  const [minWordLength, setMinWordLength] = useState(4);
  const [minFrequency, setMinFrequency] = useState(2);
  const [excludedWords, setExcludedWords] = useState<Set<string>>(new Set());
  const [showOnlyWord, setShowOnlyWord] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    word: string;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handle right-click on highlighted word to show context menu
   */
  const handleWordRightClick = (event: React.MouseEvent, word: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      word,
      x: event.clientX,
      y: event.clientY
    });
  };

  /**
   * Handle exclude word action
   */
  const handleExcludeWord = (word: string) => {
    setExcludedWords(prev => new Set([...prev, word]));
    setContextMenu(null);
    setShowOnlyWord(null); // Clear show-only when excluding
  };

  /**
   * Handle show-only word action
   */
  const handleShowOnlyWord = (word: string) => {
    setShowOnlyWord(word);
    setContextMenu(null);
  };

  /**
   * Handle click outside to close context menu and reset show-only
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setContextMenu(null);
      if (event.target && !(event.target as Element).closest('.highlighted-word')) {
        setShowOnlyWord(null);
      }
    }
  };

  /**
   * Handle escape key to close context menu
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setContextMenu(null);
      setShowOnlyWord(null);
    }
  };

  // Add event listeners for click outside and escape key
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Analyze redundancies when prompts or config changes
  const analysisResult = useMemo(() => {
    if (prompts.length === 0) return { analysis: new Map(), stats: null };

    const currentConfig: RedundancyConfig = {
      minWordLength,
      minFrequency,
      caseSensitive: false,
      excludeWords: excludedWords,
      ...config
    };

    return analyzeRedundancies(
      prompts.map(p => ({ content: p.content, id: p.id })),
      currentConfig
    );
  }, [prompts, config, minWordLength, minFrequency, excludedWords]);

  /**
   * Renders text with redundancy highlighting
   */
  const renderHighlightedText = (text: string, promptId: string) => {
    if (!showRedundancies || analysisResult.analysis.size === 0) {
      return <span>{text}</span>;
    }

    const words = text.split(/(\s+)/);
    const highlightedWords: React.ReactNode[] = [];

    words.forEach((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      const occurrence = analysisResult.analysis.get(cleanWord);

      // Check if this word should be highlighted
      const shouldHighlight = occurrence &&
        occurrence.frequency >= minFrequency &&
        (!showOnlyWord || showOnlyWord === cleanWord) &&
        !excludedWords.has(cleanWord);

      if (shouldHighlight) {
        // Calculate highlight intensity based on frequency and mode distribution
        const intensity = Math.min(
          (occurrence!.frequency / prompts.length) * 0.7 +
          (occurrence!.modes.size / prompts.length) * 0.3,
          1
        );

        // Convert intensity to Tailwind color class (100-500 range)
        const colorLevel = Math.floor(intensity * 400) + 100;

        highlightedWords.push(
          <span
            key={`${promptId}-${index}`}
            className={`highlighted-word bg-gradient-to-r from-yellow-${colorLevel} to-orange-${Math.max(colorLevel - 100, 100)} px-1.5 py-0.5 rounded-md cursor-pointer border border-yellow-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200 hover:shadow-md`}
            title={`"${occurrence!.word}" appears ${occurrence!.frequency} times across ${occurrence!.modes.size} modes`}
            role="button"
            tabIndex={0}
            aria-label={`${occurrence!.word} appears ${occurrence!.frequency} times`}
            onContextMenu={(e) => handleWordRightClick(e, cleanWord)}
            onClick={(e) => {
              e.preventDefault();
              handleShowOnlyWord(cleanWord);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleShowOnlyWord(cleanWord);
              }
            }}
          >
            {word}
          </span>
        );
      } else {
        highlightedWords.push(<span key={`${promptId}-${index}`}>{word}</span>);
      }
    });

    return <span>{highlightedWords}</span>;
  };

  /**
   * Toggles redundancy highlighting on/off
   */
  const toggleRedundancies = () => {
    setShowRedundancies(!showRedundancies);
  };

  if (prompts.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-4 ${className}`}>
        No prompts to analyze
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} ref={containerRef}>
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
            "{contextMenu.word}"
          </div>
          <button
            onClick={() => handleShowOnlyWord(contextMenu.word)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            🎯 Show Only This Word
          </button>
          <button
            onClick={() => handleExcludeWord(contextMenu.word)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            🚫 Exclude This Word
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={toggleRedundancies}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              showRedundancies
                ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-md'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md'
            }`}
            aria-pressed={showRedundancies}
            aria-label={showRedundancies ? 'Hide redundancy highlighting' : 'Show redundancy highlighting'}
          >
            {showRedundancies ? '🔍 Hide Redundancies' : '🔍 Show Redundancies'}
          </button>

          {showRedundancies && (
            <>
              <div className="flex items-center gap-2">
                <label htmlFor="minWordLength" className="text-sm font-medium text-gray-700">
                  Min Word Length:
                </label>
                <input
                  id="minWordLength"
                  type="number"
                  min="2"
                  max="8"
                  value={minWordLength}
                  onChange={(e) => setMinWordLength(parseInt(e.target.value) || 4)}
                  className="w-16 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="wordLengthHelp"
                />
                <span id="wordLengthHelp" className="text-xs text-gray-500">
                  (chars)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="minFrequency" className="text-sm font-medium text-gray-700">
                  Min Frequency:
                </label>
                <input
                  id="minFrequency"
                  type="number"
                  min="2"
                  max={prompts.length}
                  value={minFrequency}
                  onChange={(e) => setMinFrequency(parseInt(e.target.value) || 2)}
                  className="w-16 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="frequencyHelp"
                />
                <span id="frequencyHelp" className="text-xs text-gray-500">
                  (modes)
                </span>
              </div>
            </>
          )}

          {/* Filter State Indicators */}
          {showRedundancies && (excludedWords.size > 0 || showOnlyWord) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {showOnlyWord && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200">
                  🎯 Only: "{showOnlyWord}"
                  <button
                    onClick={() => setShowOnlyWord(null)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Clear show-only filter for "${showOnlyWord}"`}
                  >
                    ×
                  </button>
                </div>
              )}
              {excludedWords.size > 0 && (
                <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200">
                  🚫 Excluded: {excludedWords.size} word{excludedWords.size !== 1 ? 's' : ''}
                  <button
                    onClick={() => setExcludedWords(new Set())}
                    className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                    aria-label="Clear all excluded words"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Clear All Filters Button */}
          {showRedundancies && (excludedWords.size > 0 || showOnlyWord) && (
            <div className="mt-2">
              <button
                onClick={() => {
                  setExcludedWords(new Set());
                  setShowOnlyWord(null);
                }}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                🔄 Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        {showRedundancies && analysisResult.stats && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <strong>{analysisResult.stats.redundantWords}</strong> redundant words
                ({analysisResult.stats.redundancyPercentage.toFixed(1)}% of total)
              </div>
              {analysisResult.stats.mostFrequent.length > 0 && (
                <div>
                  Most frequent: {analysisResult.stats.mostFrequent.slice(0, 3).map(w => `"${w.word}" (${w.frequency})`).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prompts Display */}
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="border rounded-lg p-4 bg-white">
            {showPromptNames && prompt.name && (
              <div className="font-medium text-gray-900 mb-2 pb-2 border-b border-gray-200">
                {prompt.name}
              </div>
            )}
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {renderHighlightedText(prompt.content, prompt.id)}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      {showRedundancies && analysisResult.analysis.size > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-2">🎨 Color Legend:</div>
            <div className="space-y-1">
              <div><strong>Light yellow:</strong> Words appearing in 2-3 modes</div>
              <div><strong>Medium yellow:</strong> Words appearing in 4+ modes</div>
              <div><strong>Orange:</strong> Words appearing in most/all modes</div>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-200">
              <div className="mb-2">
                <strong>💡 Interactive Tips:</strong>
              </div>
              <div className="space-y-1 text-xs">
                <div>• Click any highlighted word to show only that word</div>
                <div>• Right-click for context menu (Exclude or Show Only)</div>
                <div>• Click outside or press Escape to reset filters</div>
                <div>• Hover to see frequency details</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedundancyHighlighter;