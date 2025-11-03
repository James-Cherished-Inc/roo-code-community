import { vi } from 'vitest';
import '@testing-library/jest-dom'

// Mock React vendor prefixed event name function that's causing issues
;(globalThis as any).getVendorPrefixedEventName = vi.fn(() => null);

// Mock navigator.clipboard for tests
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
  configurable: true,
});

// Mock sessionStorage for tests
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Mock ResizeObserver for components that use it
;(globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL constructor and related methods for file operations
;(globalThis as any).URL = class URL {
  constructor() {}
  static createObjectURL = vi.fn(() => 'mock-url');
  static revokeObjectURL = vi.fn();
};

// Mock document methods for DOM manipulation
Object.defineProperty(document, 'createElement', {
  writable: true,
  value: vi.fn().mockImplementation((tagName: string) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: vi.fn(),
      };
    }
    return {};
  }),
});

Object.defineProperty(document.body, 'appendChild', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  writable: true,
  value: vi.fn(),
});

// Mock crypto for Node.js compatibility
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn(),
    subtle: {},
  },
  writable: true,
});