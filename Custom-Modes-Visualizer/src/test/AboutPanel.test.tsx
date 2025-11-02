import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AboutPanel from '../components/AboutPanel';

describe('AboutPanel Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders panel but positioned off-screen when isOpen is false', () => {
      render(<AboutPanel isOpen={false} onClose={mockOnClose} />);

      // Panel exists but is translated off-screen
      const panel = screen.getByRole('complementary');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveClass('translate-x-full');
    });

    it('renders panel when isOpen is true', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('About Roo Modes Visualizer')).toBeInTheDocument();
      expect(screen.getByText('Roo Code Community')).toBeInTheDocument();
    });

    it('renders overlay when panel is open', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const overlay = screen.getByTestId('overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('bg-black', 'bg-opacity-50', 'z-40');
    });

    it('renders panel with correct styling', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('complementary');
      expect(panel).toHaveClass(
        'fixed', 'top-0', 'right-0', 'h-full',
        'bg-gradient-to-br', 'from-purple-800', 'to-purple-900',
        'text-white', 'shadow-lg', 'z-50', 'transition-transform',
        'duration-300', 'ease-in-out', 'overflow-y-auto'
      );
    });

    it('renders slide-in animation when open', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('complementary');
      expect(panel).toHaveClass('translate-x-0');
    });

    it('renders slide-out animation when closed', () => {
      render(<AboutPanel isOpen={false} onClose={mockOnClose} />);

      // When closed, panel should be translated off-screen (translate-x-full)
      const panel = screen.getByRole('complementary');
      expect(panel).toHaveClass('translate-x-full');
    });
  });

  describe('Close Button', () => {
    it('renders close button with correct styling', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close About Panel');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass(
        'absolute', 'top-2', 'right-2', 'text-2xl', 'text-white',
        'hover:text-gray-300', 'focus:outline-none'
      );
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close About Panel');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Click Outside to Close', () => {
    it('calls onClose when clicking on overlay', async () => {
      const user = userEvent.setup();
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const overlay = screen.getByTestId('overlay');
      await user.click(overlay);

      // Should be called once for overlay click
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside panel', async () => {
      const user = userEvent.setup();
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('complementary');
      await user.click(panel);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Escape Key to Close', () => {
    it('calls onClose when Escape key is pressed', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when other keys are pressed', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('does not respond to Escape key when panel is closed', () => {
      render(<AboutPanel isOpen={false} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Content Sections', () => {
    it('renders author info section', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Roo Code Community')).toBeInTheDocument();
      expect(screen.getByText('Building tools for AI-assisted development')).toBeInTheDocument();
    });

    it('renders about section with correct content', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('About Roo Modes Visualizer')).toBeInTheDocument();
      expect(screen.getByText(/Roo Modes Visualizer is a powerful tool/)).toBeInTheDocument();
    });

    it('renders support section with GitHub link', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const supportButton = screen.getByText('Support Roo Code');
      expect(supportButton).toBeInTheDocument();
      expect(supportButton.closest('a')).toHaveAttribute('href', 'https://github.com/RooVetGit/Roo-Code');
    });

    it('renders contribute section with GitHub link', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const contributeButton = screen.getByText('Contribute to Roo Code');
      expect(contributeButton).toBeInTheDocument();
      expect(contributeButton.closest('a')).toHaveAttribute('href', 'https://github.com/RooVetGit/Roo-Code');
    });

    it('renders social links', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
      expect(screen.getByLabelText('Discord')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText('Close About Panel')).toBeInTheDocument();
      expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
      expect(screen.getByLabelText('Discord')).toBeInTheDocument();
    });

    it('has proper role for panel', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('complementary');
      expect(panel).toBeInTheDocument();
    });

    it('has keyboard accessible links', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Responsive Design', () => {
    it('has responsive width classes', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('complementary');
      expect(panel).toHaveClass('w-80', 'sm:w-96');
    });

    it('has scrollable content', () => {
      render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('complementary');
      expect(panel).toHaveClass('overflow-y-auto');
    });
  });

  describe('Event Listener Cleanup', () => {
    it('removes event listeners when unmounted', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('removes event listeners when panel closes', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { rerender } = render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

      rerender(<AboutPanel isOpen={false} onClose={mockOnClose} />);

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});

// Overlay interaction is already tested in the Click Outside to Close section

describe('Animation Classes', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies transform classes correctly', () => {
    const { rerender } = render(<AboutPanel isOpen={true} onClose={mockOnClose} />);

    let panel = screen.getByRole('complementary');
    expect(panel).toHaveClass('translate-x-0');

    rerender(<AboutPanel isOpen={false} onClose={mockOnClose} />);

    // When closed, panel should be translated off-screen
    panel = screen.getByRole('complementary');
    expect(panel).toHaveClass('translate-x-full');
  });
});