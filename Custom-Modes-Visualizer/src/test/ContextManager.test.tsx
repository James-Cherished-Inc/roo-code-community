import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import ContextManager from '../components/ContextManager';

const user = userEvent.setup();

describe('ContextManager', () => {
  test('renders with default values and shows correct recommendation', async () => {
    render(<ContextManager />);
    
    // Check inputs have default values
    expect(screen.getByLabelText(/System Prompt Size/i)).toHaveValue('2000');
    expect(screen.getByLabelText(/Current Chat History/i)).toHaveValue('5000');
    expect(screen.getByLabelText(/Number of Turns/i)).toHaveValue('5');
    expect(screen.getByLabelText(/Files Read/i)).toHaveValue('2');
    expect(screen.getByLabelText(/How many more messages/i)).toHaveValue('5');
    
    // Default: MARGINAL (breakEven ~4 < planned 5)
    await waitFor(() => {
      expect(screen.getByText(/MARGINAL/i)).toBeInTheDocument();
    });
    
    // Total context 7000
    expect(screen.getByText('7,000 tokens')).toBeInTheDocument();
  });

  test('input changes trigger real-time recalculation and update recommendation', async () => {
    render(<ContextManager />);
    
    const historyInput = screen.getByLabelText(/Current Chat History/i);
    
    // Reduce history to trigger STAY
    await user.clear(historyInput);
    await user.type(historyInput, '1000');
    
    await waitFor(() => {
      expect(screen.getByText(/STAY/i)).toBeInTheDocument();
    });
    
    // Total updates to 3000
    await waitFor(() => {
      expect(screen.getByText('3,000 tokens')).toBeInTheDocument();
    });
  });

  test('urgent switch scenario with risk warnings', async () => {
    render(<ContextManager />);
    
    // High history for urgent
    const historyInput = screen.getByLabelText(/Current Chat History/i);
    await user.clear(historyInput);
    await user.type(historyInput, '30000');
    
    await waitFor(() => {
      expect(screen.getByText(/SWITCH NOW/i)).toBeInTheDocument();
    });
    
    // High turns/files for warnings
    const turnsInput = screen.getByLabelText(/Number of Turns/i);
    await user.clear(turnsInput);
    await user.type(turnsInput, '25');
    
    const filesInput = screen.getByLabelText(/Files Read/i);
    await user.clear(filesInput);
    await user.type(filesInput, '10');
    
    await waitFor(() => {
      expect(screen.getByText(/High turn count detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Many files in context/i)).toBeInTheDocument();
    });
  });

  test('cost calculations match Claude 3.5 Sonnet pricing', async () => {
    render(<ContextManager />);
    
    // Specific: system=10000, history=1000, planned=10
    const systemInput = screen.getByLabelText(/System Prompt Size/i);
    await user.clear(systemInput);
    await user.type(systemInput, '10000');
    
    const historyInput = screen.getByLabelText(/Current Chat History/i);
    await user.clear(historyInput);
    await user.type(historyInput, '1000');
    
    const plannedInput = screen.getByLabelText(/How many more messages/i);
    await user.clear(plannedInput);
    await user.type(plannedInput, '10');
    
    await waitFor(() => {
      expect(screen.getByText('11,000 tokens')).toBeInTheDocument();
      expect(screen.getByText('$0.0033')).toBeInTheDocument(); // per turn cached
      expect(screen.getByText('$0.0300')).toBeInTheDocument(); // switch full
    });
  });
});