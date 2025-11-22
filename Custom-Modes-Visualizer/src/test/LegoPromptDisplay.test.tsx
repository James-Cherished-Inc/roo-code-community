// Lego-style Prompt Display Testing Suite
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColoredPromptDisplay from '../components/ColoredPromptDisplay';
import PromptDisplayBlock from '../components/PromptDisplayBlock';
import { ModeProvider } from '../context/ModeContext';

describe('PromptDisplayBlock', () => {
  const mockBlock = {
    id: 'test-block',
    type: 'feature' as const,
    title: 'Test Feature',
    content: 'This is test content for the block.',
    colorConfig: {
      background: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-900',
      hover: 'hover:from-blue-100 hover:to-blue-200',
      shadow: 'shadow-blue-200'
    },
    featureId: 'test-feature',
    featureName: 'Test Feature'
  };

  test('renders block with correct structure', () => {
    render(<PromptDisplayBlock block={mockBlock} />);
    
    expect(screen.getByTitle('Test Feature block')).toBeInTheDocument();
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is test content for the block.')).toBeInTheDocument();
    expect(screen.getByText('FEATURE')).toBeInTheDocument();
  });

  test('shows correct icons for different block types', () => {
    const { rerender } = render(<PromptDisplayBlock block={mockBlock} />);
    
    const baseBlock = { ...mockBlock, type: 'base' as const, title: 'Base Mode' };
    rerender(<PromptDisplayBlock block={baseBlock} />);
    expect(screen.getByText('🎯')).toBeInTheDocument();
    
    const customBlock = { ...mockBlock, type: 'custom' as const, title: 'Custom Instructions' };
    rerender(<PromptDisplayBlock block={customBlock} />);
    expect(screen.getByText('✨')).toBeInTheDocument();
  });
});

describe('ColoredPromptDisplay Integration Tests', () => {
  const renderWithProvider = (props: any) => {
    return render(
      <ModeProvider>
        <ColoredPromptDisplay {...props} />
      </ModeProvider>
    );
  };

  test('renders base mode only', () => {
    renderWithProvider({
      promptText: 'You are a helpful assistant.',
      baseModeName: 'Basic Assistant',
      enabledFeatures: [],
      customInstructions: ''
    });
    
    expect(screen.getByText('Basic Assistant')).toBeInTheDocument();
    expect(screen.getByText('You are a helpful assistant.')).toBeInTheDocument();
  });

  test('renders single feature', () => {
    renderWithProvider({
      promptText: 'You are a helpful assistant.',
      baseModeName: 'Technical Assistant',
      enabledFeatures: [{
        id: 'empathyFriendlyTone',
        name: 'Empathy & Friendly Tone Guidelines',
        description: 'Be empathetic and friendly while explaining decisions.'
      }],
      customInstructions: ''
    });
    
    expect(screen.getByText('Technical Assistant')).toBeInTheDocument();
    expect(screen.getByText('Empathy & Friendly Tone Guidelines Enhancement')).toBeInTheDocument();
    expect(screen.getByText('• Empathy & Friendly Tone Guidelines')).toBeInTheDocument();
  });

  test('renders custom instructions', () => {
    renderWithProvider({
      promptText: 'You are a helpful assistant.',
      baseModeName: 'Custom Assistant',
      enabledFeatures: [],
      customInstructions: 'Please include code examples.'
    });
    
    expect(screen.getByText('Additional Instructions')).toBeInTheDocument();
    expect(screen.getByText('Please include code examples.')).toBeInTheDocument();
  });

  test('toggles between block and raw text views', async () => {
    renderWithProvider({
      promptText: 'You are a helpful assistant.',
      baseModeName: 'Test Assistant',
      enabledFeatures: [],
      customInstructions: ''
    });
    
    // Initially should show block view
    expect(screen.getByText('Test Assistant')).toBeInTheDocument();
    
    // Click raw text toggle
    const toggleButton = screen.getByText('Raw');
    fireEvent.click(toggleButton);
    
    // Should now show raw text
    await waitFor(() => {
      expect(screen.getByText('You are a helpful assistant.')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Blocks')).toBeInTheDocument();
  });

  test('copy functionality works', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    });
    
    renderWithProvider({
      promptText: 'You are a helpful assistant.',
      baseModeName: 'Test Assistant',
      enabledFeatures: [],
      customInstructions: ''
    });
    
    const copyButton = screen.getByTitle('Copy prompt to clipboard');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('You are a helpful assistant.');
  });
});