import { describe, it, expect } from 'vitest';
import { getFeatureColor, CATEGORY_COLOR_PALETTES } from '../utils/colorSystem';

describe('Category-based Color System', () => {
  it('should return consistent colors for same feature ID', () => {
    const color1 = getFeatureColor('test-feature-1', 'Test Feature 1');
    const color2 = getFeatureColor('test-feature-1', 'Test Feature 1');
    expect(color1.background).toBe(color2.background);
    expect(color1.border).toBe(color2.border);
    expect(color1.text).toBe(color2.text);
  });

  it('should return different colors for different feature IDs', () => {
    const color1 = getFeatureColor('test-feature-1', 'Test Feature 1');
    const color2 = getFeatureColor('test-feature-2', 'Test Feature 2');
    expect(color1.background).not.toBe(color2.background);
  });

  it('should return category-based colors when categoryId is provided', () => {
    const commColor = getFeatureColor('feature-1', 'Test Feature', 'communication-style');
    const procColor = getFeatureColor('feature-2', 'Test Feature', 'process-planning');
    
    // Both should be valid Tailwind classes
    expect(commColor.background).toMatch(/^bg-[a-z]+-[0-9]+$/);
    expect(procColor.background).toMatch(/^bg-[a-z]+-[0-9]+$/);
    
    // Should be different
    expect(commColor.background).not.toBe(procColor.background);
  });

  it('should return fallback colors for unknown categories', () => {
    const unknownCatColor = getFeatureColor('feature-1', 'Test Feature', 'unknown-category');
    expect(unknownCatColor.background).toMatch(/^bg-[a-z]+-[0-9]+$/);
    expect(unknownCatColor.border).toMatch(/^border-[a-z]+-[0-9]+$/);
  });

  it('should maintain backward compatibility without categoryId', () => {
    const oldStyleColor = getFeatureColor('feature-without-category', 'Test Feature');
    expect(oldStyleColor.background).toBeTruthy();
    expect(oldStyleColor.border).toBeTruthy();
    expect(oldStyleColor.text).toBeTruthy();
    expect(oldStyleColor.hover).toBeTruthy();
    expect(oldStyleColor.shadow).toBeTruthy();
  });

  it('should have proper color palettes defined', () => {
    expect(CATEGORY_COLOR_PALETTES).toHaveProperty('communication-style');
    expect(CATEGORY_COLOR_PALETTES).toHaveProperty('process-planning');
    expect(CATEGORY_COLOR_PALETTES).toHaveProperty('technical-expertise');
    expect(CATEGORY_COLOR_PALETTES).toHaveProperty('tool-integration');
    
    // Each palette should have multiple colors
    expect(CATEGORY_COLOR_PALETTES['communication-style'].length).toBeGreaterThan(0);
    expect(CATEGORY_COLOR_PALETTES['process-planning'].length).toBeGreaterThan(0);
    expect(CATEGORY_COLOR_PALETTES['technical-expertise'].length).toBeGreaterThan(0);
    expect(CATEGORY_COLOR_PALETTES['tool-integration'].length).toBeGreaterThan(0);
  });

  it('should return built-in colors for known features without category', () => {
    const builtInColor = getFeatureColor('empathyFriendlyTone', 'Empathy & Friendly Tone Guidelines');
    expect(builtInColor.background).toBe('bg-blue-100');
    expect(builtInColor.border).toBe('border-blue-300');
    expect(builtInColor.text).toBe('text-blue-900');
  });
});