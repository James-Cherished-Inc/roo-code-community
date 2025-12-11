import React, { useState } from 'react';

/**
 * Props for the MarkdownToggle component
 */
interface MarkdownToggleProps {
  /** Callback when toggle state changes */
  onToggle: (isMarkdown: boolean) => void;
  /** Initial state of the toggle */
  initialMarkdown?: boolean;
}

/**
 * Toggle switch component with "< >" icon for switching between plain text and markdown modes
 */
const MarkdownToggle: React.FC<MarkdownToggleProps> = ({ onToggle, initialMarkdown = false }) => {
  const [isMarkdown, setIsMarkdown] = useState(initialMarkdown);

  const handleToggle = () => {
    const newState = !isMarkdown;
    setIsMarkdown(newState);
    onToggle(newState);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          isMarkdown ? 'bg-green-600' : 'bg-gray-300'
        }`}
        title={isMarkdown ? 'Switch to plain text' : 'Switch to markdown'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isMarkdown ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-mono font-bold transition-colors ${
            isMarkdown ? 'text-white' : 'text-gray-700'
          }`}
        >
          {'<'}{'>'}
        </span>
      </button>
      <span className="text-xs text-gray-600 font-mono">
        {isMarkdown ? 'MD' : 'TEXT'}
      </span>
    </div>
  );
};

export default MarkdownToggle;