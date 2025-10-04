import React, { useState, useEffect } from 'react';
import { useModes } from '../context/ModeContext';
import PromptBuilder from '../components/PromptBuilder';

/**
 * Page component for the prompt builder functionality
 */
const PromptBuilderPage: React.FC = () => {
  const { modes } = useModes();
  const [showPopup, setShowPopup] = useState(false);

  /**
   * Show work in progress popup on component mount
   */
  useEffect(() => {
    setShowPopup(true);
  }, []);

  return (
    <>
      {/* Work in Progress Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Work in Progress - Preview Only
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                This feature is currently under development. Please note that this is a preview version and may contain bugs or incomplete functionality.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Prompt Builder</h1>
          <p className="text-gray-600">
            Construct custom prompts by selecting base modes and adding additional instructions.
          </p>
        </div>

      <div className="mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How it works</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Select a base mode, add custom instructions, and generate a tailored prompt.
                  The generated prompt combines the base mode's system prompt with your additional requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PromptBuilder modes={modes} />
    </div>
    </>
  );
};

export default PromptBuilderPage;