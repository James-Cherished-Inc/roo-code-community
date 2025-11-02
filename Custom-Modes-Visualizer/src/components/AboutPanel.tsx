import React, { useEffect, useRef } from 'react';

interface AboutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutPanel: React.FC<AboutPanelProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Panel */}
      <div
        ref={panelRef}
        role="complementary"
        aria-label="About panel"
        className={`fixed top-0 right-0 h-full bg-white text-slate-900 shadow-lg z-50 transition-transform duration-300 ease-in-out overflow-y-auto border-l-4 border-purple-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-80 sm:w-96`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl text-slate-600 hover:text-slate-800 focus:outline-none"
          aria-label="Close About Panel"
        >
          ×
        </button>

        {/* Content */}
        <div className="p-5 pt-10">
          {/* Author Info */}
          <div className="text-center mb-8">
            <img
              src="James_Photo.jpg" // James Cherished photo from DistroChoser
              alt="Sir James Cherished"
              className="w-30 h-30 rounded-full border-4 border-purple-500 object-cover mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Sir James Cherished</h3>
            <p className="text-sm text-slate-600">Passionate developer building open-source tools</p>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">About Me</h3>
             <div className="text-sm text-slate-600 space-y-2">
               <p>
                 Hi, I'm James! I hope you're enjoying the tools I build.
               </p>
               <p>
                 I'm a solo dev and a new Linux fan. I'm driven by the idea of an equitable chance to anyone on Earth to freely pursue their dreams and fulfillment, for free. An Internet connection as the single requirement brings this truer and truer with each effort.
               </p>
               <p>
                 Linux contributes to this realization and I hope this can be a small gift to the community.
               </p>
             </div>
           </div>

           {/* Contribute Section */}
           <div className="mb-6">
             <h3 className="text-lg font-semibold mb-3 text-slate-900">Why a Cherished-ModesVisualizer?</h3>
             <div className="text-sm text-slate-600 space-y-2 mb-4">
              <p>
                Arguably, choosing your AI mode is one of the most fun thing about AI-assisted development. It's also one of the best way for newbies to learn about technicalities, a good reason to dive the rabbit hole and uncover its history. The existing mode visualizers did not meet my needs, and I built this just for myself. A nice, filterable, exhaustive table allows me a tailored selection and quick glances to select the right choice for my different needs.
              </p>
              <p>
                Roo Code community is welcome to contribute. You can request or add a new mode, correct mistakes or add relevant context/information for a data point, and even argue about calculation methods :) DM me on X or join the debate on Github.
              </p>
            </div>
            <a
              href="https://github.com/James-Cherished-Inc/Roo-Modes-Visualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-500 text-white px-6 py-2 rounded-full font-semibold text-center hover:bg-purple-600 transition-colors duration-200"
            >
              Contribute
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com/James-Cherished-Inc"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200 hover:scale-110"
              aria-label="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://x.com/JamesCherished"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200 hover:scale-110"
              aria-label="X (Twitter)"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPanel;