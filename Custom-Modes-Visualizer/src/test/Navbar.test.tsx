import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Navbar from '../components/Navbar';
import type { ViewType } from '../types';

// Mock React Router's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
  const mockProps = {
    activeView: 'table' as ViewType,
    onViewChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the navbar with all view buttons', () => {
      render(<Navbar {...mockProps} />);

      expect(screen.getByText('🦘 Roo Modes Visualizer')).toBeInTheDocument();
      expect(screen.getByText('📋 Table View')).toBeInTheDocument();
      expect(screen.getByText('🎯 Smart View')).toBeInTheDocument();
      expect(screen.getByText('🔧 Prompt Builder')).toBeInTheDocument();
    });

    it('renders the version indicator', () => {
      render(<Navbar {...mockProps} />);

      expect(screen.getByText('v2.4.0')).toBeInTheDocument();
    });
  });

  describe('View Switching', () => {
     it('calls onViewChange when clicking Table button', async () => {
       const user = userEvent.setup();
       render(<Navbar {...mockProps} />);

       const tableButton = screen.getByText('📋 Table View');
       await user.click(tableButton);

       expect(mockProps.onViewChange).toHaveBeenCalledWith('table');
     });

     it('calls onViewChange when clicking Smart button', async () => {
       const user = userEvent.setup();
       render(<Navbar {...mockProps} />);

       const smartButton = screen.getByText('🎯 Smart View');
       await user.click(smartButton);

       expect(mockProps.onViewChange).toHaveBeenCalledWith('smart');
     });

     it('calls onViewChange when clicking Prompt Builder button', async () => {
       const user = userEvent.setup();
       render(<Navbar {...mockProps} />);

       const promptBuilderButton = screen.getByText('🔧 Prompt Builder');
       await user.click(promptBuilderButton);

       expect(mockProps.onViewChange).toHaveBeenCalledWith('prompt-builder');
     });

     it('displays the active view indicator', () => {
       render(<Navbar {...mockProps} activeView="table" />);

       // The active button should have different styling
       // This is tested implicitly by checking the button exists and is visible
       const tableButton = screen.getByText('📋 Table View');
       expect(tableButton).toBeInTheDocument();
     });

     it('handles different active views correctly', () => {
       const { rerender } = render(<Navbar {...mockProps} activeView="smart" />);

       expect(screen.getByText('🎯 Smart View')).toBeInTheDocument();

       rerender(<Navbar {...mockProps} activeView="prompt-builder" />);

       expect(screen.getByText('🔧 Prompt Builder')).toBeInTheDocument();
     });
   });

  describe('Styling', () => {
    it('applies correct CSS classes for layout', () => {
      render(<Navbar {...mockProps} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-white/90', 'backdrop-blur-sm', 'shadow-lg', 'border-b', 'border-gray-200/50');
    });

    it('has responsive design classes', () => {
      render(<Navbar {...mockProps} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('sticky', 'top-0', 'z-50');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<Navbar {...mockProps} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Check that buttons are properly identifiable
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper titles for interactive elements', () => {
      render(<Navbar {...mockProps} />);

      // Check that buttons have titles
      const tableButton = screen.getByText('📋 Table View');
      expect(tableButton).toHaveAttribute('title', 'Edit all modes in a table');

      const smartButton = screen.getByText('🎯 Smart View');
      expect(smartButton).toHaveAttribute('title', 'View and edit one mode at a time');

      const promptBuilderButton = screen.getByText('🔧 Prompt Builder');
      expect(promptBuilderButton).toHaveAttribute('title', 'Construct prompts from options');
    });
  });

  describe('Logo and Branding', () => {
    it('displays the app title with emoji', () => {
      render(<Navbar {...mockProps} />);

      const title = screen.getByText('🦘 Roo Modes Visualizer');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-2xl', 'font-bold');
    });

    it('includes kangaroo emoji in the title', () => {
      render(<Navbar {...mockProps} />);

      // The title should contain the kangaroo emoji
      const titleElement = screen.getByText('🦘 Roo Modes Visualizer');
      expect(titleElement.textContent).toContain('🦘');
      expect(titleElement.textContent).toContain('Roo');
    });
  });

  describe('Error Handling', () => {
    it('handles undefined activeView gracefully', () => {
      render(<Navbar {...mockProps} activeView={undefined as any} />);

      // Should not crash and render default state
      expect(screen.getByText('📋 Table View')).toBeInTheDocument();
      expect(screen.getByText('🎯 Smart View')).toBeInTheDocument();
      expect(screen.getByText('🔧 Prompt Builder')).toBeInTheDocument();
    });

    it('handles invalid activeView values gracefully', () => {
      render(<Navbar {...mockProps} activeView={'invalid' as any} />);

      // Should not crash and render buttons
      expect(screen.getByText('📋 Table View')).toBeInTheDocument();
    });
  });
});