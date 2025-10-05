import React from 'react';

/**
 * Props for the EmojiSelector component
 */
interface EmojiSelectorProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
}

/**
 * Simple emoji selector component for mode creation
 */
const EmojiSelector: React.FC<EmojiSelectorProps> = ({ selectedEmoji, onEmojiSelect }) => {
  // Common emojis suitable for modes - similar to existing default modes
  const emojis = [
    '🏗️', '💻', '🐛', '❓', '🎯', '🚀', '⚡', '🔧', '📝', '🎨',
    '🔍', '📊', '🎪', '⚙️', '🔥', '💡', '📋', '🎭', '⚗️', '🔮',
    '📱', '🖥️', '⌨️', '🖱️', '📟', '💾', '💿', '📀', '🔌', '🔋',
    '⭐', '🌟', '✨', '💎', '🔑', '🔒', '🚪', '🏆', '🎖️', '🏅',
    '🎯', '🎲', '♠️', '♥️', '♦️', '♣️', '🃏', '🎴', '🎨', '🎭',
    '🎪', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻',
    '🎬', '🎞️', '📽️', '🎭', '🩰', '🎨', '🖼️', '🎨', '🖌️', '🖍️'
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Emoji Icon
      </label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{selectedEmoji}</div>
          <button
            type="button"
            onClick={() => onEmojiSelect('')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Grid layout for emoji selection */}
        <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onEmojiSelect(emoji)}
              className={`p-2 text-lg hover:bg-blue-100 rounded transition-colors ${
                selectedEmoji === emoji ? 'bg-blue-200' : ''
              }`}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Click on an emoji to select it, or clear to use no emoji
      </p>
    </div>
  );
};

export default EmojiSelector;