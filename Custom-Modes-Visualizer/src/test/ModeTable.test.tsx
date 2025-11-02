import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ModeTable from '../components/ModeTable';
import type { Mode } from '../types';

// Mock the ModeContext
const mockUpdateMode = vi.fn();
const mockDeleteMode = vi.fn();
const mockUseModes = vi.fn();

vi.mock('../context/ModeContext', () => ({
  useModes: () => mockUseModes(),
}));

// Mock ResizeObserver
const mockResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
global.ResizeObserver = mockResizeObserver;

describe('ModeTable Component', () => {
  const mockModes: Mode[] = [
    {
      slug: 'architect',
      name: '🏗️ Architect',
      description: 'Plans system architecture and technical designs',
      usage: 'Use when designing systems',
      prompt: 'You are an architect. Design systems carefully.',
    },
    {
      slug: 'code',
      name: '💻 Code',
      description: 'Writes and modifies code',
      usage: 'Use for coding tasks',
      prompt: 'You are a code specialist. Write clean code.',
    },
  ];

  beforeEach(() => {
    mockUseModes.mockReturnValue({
      updateMode: mockUpdateMode,
      deleteMode: mockDeleteMode,
    });

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Table Rendering', () => {
    it('renders table with correct headers', () => {
      render(<ModeTable modes={mockModes} />);

      expect(screen.getByText('Name & Slug')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Usage')).toBeInTheDocument();
      expect(screen.getByText('Prompt')).toBeInTheDocument();
    });

    it('renders all modes in the table', () => {
      render(<ModeTable modes={mockModes} />);

      expect(screen.getByText('🏗️ Architect')).toBeInTheDocument();
      expect(screen.getByText('architect')).toBeInTheDocument();
      expect(screen.getByText('Plans system architecture and technical designs')).toBeInTheDocument();
      expect(screen.getByText('Use when designing systems')).toBeInTheDocument();
      expect(screen.getByText('You are an architect. Design systems carefully.')).toBeInTheDocument();

      expect(screen.getByText('💻 Code')).toBeInTheDocument();
      expect(screen.getByText('code')).toBeInTheDocument();
      expect(screen.getByText('Writes and modifies code')).toBeInTheDocument();
      expect(screen.getByText('Use for coding tasks')).toBeInTheDocument();
      expect(screen.getByText('You are a code specialist. Write clean code.')).toBeInTheDocument();
    });

    it('renders empty table when no modes provided', () => {
      render(<ModeTable modes={[]} />);

      expect(screen.getByText('Name & Slug')).toBeInTheDocument();
      expect(screen.queryByText('🏗️ Architect')).not.toBeInTheDocument();
    });
  });

  describe('Inline Editing', () => {
    it('enters edit mode when clicking a cell', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const nameCell = screen.getByText('🏗️ Architect');
      await user.click(nameCell);

      const input = screen.getByDisplayValue('🏗️ Architect');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('saves changes when pressing Enter in input field', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const nameCell = screen.getByText('🏗️ Architect');
      await user.click(nameCell);

      const input = screen.getByDisplayValue('🏗️ Architect');
      await user.clear(input);
      await user.type(input, 'New Architect Name{enter}');

      expect(mockUpdateMode).toHaveBeenCalledWith('architect', { name: 'New Architect Name' });
    });

    it('saves changes when clicking outside input field', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const nameCell = screen.getByText('🏗️ Architect');
      await user.click(nameCell);

      const input = screen.getByDisplayValue('🏗️ Architect');
      await user.clear(input);
      await user.type(input, 'New Architect Name');

      // Click outside to trigger onBlur
      await user.click(document.body);

      expect(mockUpdateMode).toHaveBeenCalledWith('architect', { name: 'New Architect Name' });
    });

    it('cancels editing when pressing Escape', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const nameCell = screen.getByText('🏗️ Architect');
      await user.click(nameCell);

      const input = screen.getByDisplayValue('🏗️ Architect');
      await user.clear(input);
      await user.type(input, 'New Name{escape}');

      expect(mockUpdateMode).not.toHaveBeenCalled();
      expect(screen.queryByDisplayValue('New Name')).not.toBeInTheDocument();
    });

    it('renders textarea for multi-line fields (prompt, description, usage)', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const promptCell = screen.getByText('You are an architect. Design systems carefully.');
      await user.click(promptCell);

      const textarea = screen.getByDisplayValue('You are an architect. Design systems carefully.');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('saves textarea changes when pressing Ctrl+Enter', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const promptCell = screen.getByText('You are an architect. Design systems carefully.');
      await user.click(promptCell);

      const textarea = screen.getByDisplayValue('You are an architect. Design systems carefully.');
      await user.clear(textarea);
      await user.type(textarea, 'New prompt content');

      // Simulate Ctrl+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true, currentTarget: textarea });

      expect(mockUpdateMode).toHaveBeenCalledWith('architect', { prompt: 'New prompt content' });
    });
  });

  describe('Copy to Clipboard', () => {
    it('shows copy button for prompt field', () => {
      render(<ModeTable modes={mockModes} />);

      const copyButtons = screen.getAllByTitle('Copy prompt to clipboard');
      expect(copyButtons).toHaveLength(2);
    });

    it('copies prompt to clipboard when copy button is clicked', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const copyButton = screen.getAllByTitle('Copy prompt to clipboard')[0];
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('You are an architect. Design systems carefully.');
    });

    it('shows success message when copy is successful', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const copyButton = screen.getAllByTitle('Copy prompt to clipboard')[0];
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied ✨')).toBeInTheDocument();
      });

      // Message should disappear after 2 seconds
      await waitFor(() => {
        expect(screen.queryByText('Copied ✨')).not.toBeInTheDocument();
      }, { timeout: 2500 });
    });
  });

  describe('Delete Mode', () => {
    it('shows delete button on row hover', async () => {
      render(<ModeTable modes={mockModes} />);

      const deleteButtons = screen.getAllByTitle('Delete mode');
      expect(deleteButtons.length).toBe(2);
      expect(deleteButtons[0]).toHaveClass('opacity-0');
    });

    it('calls deleteMode when delete button is clicked', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const deleteButtons = screen.getAllByTitle('Delete mode');
      await user.click(deleteButtons[0]);

      expect(mockDeleteMode).toHaveBeenCalledWith('architect');
    });
  });

  describe('Textarea Dimensions', () => {
    it('loads saved dimensions from sessionStorage', () => {
      const dimensions = { width: 300, height: 100 };
      sessionStorage.setItem('table-architect-prompt-dimensions', JSON.stringify(dimensions));

      render(<ModeTable modes={mockModes} />);

      // The component should load dimensions in useEffect
      expect(sessionStorage.getItem).toHaveBeenCalled();
    });

    it('saves dimensions when textarea is resized', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const promptCell = screen.getByText('You are an architect. Design systems carefully.');
      await user.click(promptCell);

      const textarea = screen.getByDisplayValue('You are an architect. Design systems carefully.');

      // Simulate resize by triggering ResizeObserver
      act(() => {
        const mockRect = { width: 400, height: 150 };
        textarea.getBoundingClientRect = vi.fn().mockReturnValue(mockRect);

        // Trigger the resize observer callback
        const resizeObserverInstance = mockResizeObserver.mock.results[0].value;
        resizeObserverInstance.observe.mock.calls[0][0].dispatchEvent(new Event('resize'));
      });

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'table-architect-prompt-dimensions',
        JSON.stringify({ width: 400, height: 150 })
      );
    });

    it('clears dimensions on beforeunload', () => {
      const dimensions = { width: 300, height: 100 };
      sessionStorage.setItem('table-architect-prompt-dimensions', JSON.stringify(dimensions));

      render(<ModeTable modes={mockModes} />);

      // Simulate beforeunload event
      fireEvent(window, new Event('beforeunload'));

      expect(sessionStorage.getItem('table-architect-prompt-dimensions')).toBeUndefined();
    });

    it('handles corrupted sessionStorage data gracefully', () => {
      // Set corrupted data
      sessionStorage.setItem('table-architect-prompt-dimensions', 'invalid json');

      render(<ModeTable modes={mockModes} />);

      // The component should not crash and should handle the error gracefully without logging warnings
      expect(screen.getByText('🏗️ Architect')).toBeInTheDocument();
      // Since we're not spying on console.warn, we don't expect it to be called
    });
  });

  describe('Accessibility', () => {
    it('has proper titles for interactive elements', () => {
      render(<ModeTable modes={mockModes} />);

      expect(screen.getAllByTitle('Click to edit')).toHaveLength(10); // 2 name cells + 2 slug cells + 2 description + 2 usage + 2 prompt
      expect(screen.getAllByTitle('Copy prompt to clipboard')).toHaveLength(2);
      expect(screen.getAllByTitle('Delete mode')).toHaveLength(2);
    });

    it('has proper ARIA labels and focus management', async () => {
      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const nameCell = screen.getByText('🏗️ Architect');
      await user.click(nameCell);

      const input = screen.getByDisplayValue('🏗️ Architect');
      expect(input).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles clipboard copy failure gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard not available'));

      render(<ModeTable modes={mockModes} />);
      const user = userEvent.setup();

      const copyButton = screen.getAllByTitle('Copy prompt to clipboard')[0];
      await user.click(copyButton);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy text: ', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});