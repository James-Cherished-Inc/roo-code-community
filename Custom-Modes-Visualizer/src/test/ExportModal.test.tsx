import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportModal from '../components/ExportModal';
import type { Mode } from '../types';

// Minimal mock of useModes to satisfy ExportModal without coupling to implementation
vi.mock('../context/ModeContext', () => ({
  useModes: () => ({
    exportSelectedModes: () => true
  })
}));

describe('ExportModal - family badges', () => {
  const baseModes: Mode[] = [
    {
      slug: 'with-family',
      name: 'Mode With Family',
      description: 'Has a family',
      usage: 'Use when testing family badge',
      prompt: 'Test prompt',
      family: 'default'
    },
    {
      slug: 'without-family',
      name: 'Mode Without Family',
      description: 'No family set',
      usage: 'Use when testing absence of badge',
      prompt: 'Another test prompt'
      // family intentionally omitted
    }
  ];

  const renderModal = (modes: Mode[] = baseModes) =>
    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        availableModes={modes}
      />
    );

  it('renders a family badge next to modes that have a family', () => {
    renderModal();

    // Ensure the labeled mode is present
    const withFamilyLabel = screen.getByText('Mode With Family');
    expect(withFamilyLabel).toBeInTheDocument();

    // The badge uses the raw family string as text
    const familyBadge = screen.getByText('default');
    expect(familyBadge).toBeInTheDocument();

    // Badge should be visually associated: click on the label area should toggle checkbox
    const checkbox = screen.getByRole('checkbox', { name: /Mode With Family/i });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(withFamilyLabel);
    expect(checkbox).toBeChecked();

    // Tooltip/title should include the family for clarity
    expect(familyBadge).toHaveAttribute('title', 'Family: default');
  });

  it('does not render a family badge for modes without a family', () => {
    renderModal();

    const withoutFamilyLabel = screen.getByText('Mode Without Family');
    expect(withoutFamilyLabel).toBeInTheDocument();

    // There should be no element showing an empty or generic badge
    // We assert by checking that the specific family string is not present
    // and that there is exactly one "default" badge from the first mode.
    const defaultBadges = screen.getAllByText('default');
    expect(defaultBadges.length).toBe(1);

    // No badge text corresponding uniquely to the mode without family
    // (defensive: if someone accidentally adds a badge with empty content, it wouldn't match any getByText)
  });

  it('keeps export controls functional with badges present', () => {
    const onClose = vi.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        availableModes={baseModes}
      />
    );

    // Select a mode and trigger export
    const checkbox = screen.getByRole('checkbox', { name: /Mode With Family/i });
    fireEvent.click(checkbox);
    const exportButton = screen.getByRole('button', { name: /Export 1 Mode/ });
    expect(exportButton).toBeEnabled();
  });
});