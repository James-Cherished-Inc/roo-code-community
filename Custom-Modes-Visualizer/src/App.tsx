import { useState } from 'react';
import { ModeProvider } from './context/ModeContext';
import Navbar from './components/Navbar';
import AboutPanel from './components/AboutPanel';
import TableViewPage from './pages/TableViewPage';
import SmartViewPage from './pages/SmartViewPage';
import PromptBuilderPage from './pages/PromptBuilderPage';
import type { ViewType } from './types';

/**
 * Main App component with routing between different views
 */
function App() {
  const [activeView, setActiveView] = useState<ViewType>('table');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  /**
   * Render the active view component
   */
  const renderActiveView = () => {
    switch (activeView) {
      case 'table':
        return <TableViewPage />;
      case 'smart':
        return <SmartViewPage />;
      case 'prompt-builder':
        return <PromptBuilderPage />;
      default:
        return <TableViewPage />;
    }
  };

  return (
    <ModeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Navigation */}
        <Navbar activeView={activeView} onViewChange={setActiveView} onAboutClick={() => setIsAboutOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* About Panel Overlay */}
        <AboutPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </ModeProvider>
  );
}

export default App;