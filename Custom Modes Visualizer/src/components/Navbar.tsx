import React from 'react';
import type { ViewType } from '../types';

/**
 * Props for the Navbar component
 */
interface NavbarProps {
  /** Currently active view */
  activeView: ViewType;
  /** Callback to change the active view */
  onViewChange: (view: ViewType) => void;
}

/**
 * Navigation bar component for switching between different views
 */
const Navbar: React.FC<NavbarProps> = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'table' as ViewType, label: '📋 Table View', description: 'Edit all modes in a table' },
    { id: 'smart' as ViewType, label: '🎯 Smart View', description: 'View and edit one mode at a time' },
    { id: 'prompt-builder' as ViewType, label: '🔧 Prompt Builder', description: 'Construct prompts from options' },
  ];

  return (
    <nav className="backdrop-blur-lg bg-white/80 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🦘 Roo Modes Visualizer
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`relative inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 backdrop-blur-sm'
                }`}
                title={view.description}
              >
                {view.label}
                {activeView === view.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25"></div>
                )}
              </button>
            ))}
          </div>

          {/* Version indicator */}
          <div className="flex items-center">
            <span className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full font-medium">
              v0.1.0
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;