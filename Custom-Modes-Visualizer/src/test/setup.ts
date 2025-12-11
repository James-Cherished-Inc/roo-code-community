import { vi } from 'vitest';
import '@testing-library/jest-dom'

/**
 * React DOM environment shims
 *
 * Goal:
 * - Provide a safe, browser-like surface for React DOM internals that run during setup.
 * - Specifically, avoid crashes in ReactDOM's getVendorPrefixedEventName, which expects
 *   to probe CSS properties on a style-like object using the `in` operator.
 *
 * Strategy:
 * - Do NOT patch React internals.
 * - Instead, ensure:
 *   - document.body exists.
 *   - document.body.style is a non-null, object-like value.
 *   - window.getComputedStyle exists and always returns an object (never undefined),
 *     so that React's vendor-prefixed event detection can safely run.
 *
 * This keeps the behavior realistic enough for components, without hiding legitimate bugs.
 */

// Ensure document.body exists (happy-dom usually does, but guard defensively)
if (!document.body) {
  const body = document.createElement('body');
  (document as any).body = body;

  if (!document.documentElement) {
    const html = document.createElement('html');
    html.appendChild(body);
    (document as any).documentElement = html;
  }
}

// Ensure document.body.style is always defined and object-like
if (!document.body.style || typeof document.body.style !== 'object') {
  Object.defineProperty(document.body, 'style', {
    value: {},
    writable: true,
    configurable: true,
  });
}

/**
 * Ensure HTMLElement instances always expose a style object.
 * ReactDOM's getVendorPrefixedEventName reads from an element's style and uses
 * `styleProp in style`. In some jsdom/happy-dom edge cases, style can be missing,
 * which would make `in` throw. This keeps semantics minimal and local to tests.
 */
if (typeof (globalThis as any).HTMLElement === 'undefined') {
  (globalThis as any).HTMLElement = class HTMLElement {};
}

(() => {
  const HTMLElementCtor =
    (globalThis as any).HTMLElement &&
    ((globalThis as any).HTMLElement.prototype || (globalThis as any).HTMLElement);

  if (!HTMLElementCtor) return;

  const hasOwnStyle = Object.prototype.hasOwnProperty.call(HTMLElementCtor, 'style');

  if (!hasOwnStyle) {
    Object.defineProperty(HTMLElementCtor, 'style', {
      configurable: true,
      get() {
        if (!(this as any).__style) {
          (this as any).__style = {};
        }
        return (this as any).__style;
      },
      set(value: any) {
        (this as any).__style = value && typeof value === 'object' ? value : {};
      },
    });
  }
})();
// Ensure a safe getComputedStyle implementation
if (typeof window.getComputedStyle !== 'function') {
  (window as any).getComputedStyle = (el: Element | null) => {
    if (!el) return {} as CSSStyleDeclaration;
    const style = (el as any).style;
    return (style && typeof style === 'object' ? style : {}) as CSSStyleDeclaration;
  };
} else {
  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  (window as any).getComputedStyle = (el: Element | null, pseudo?: string | null) => {
    if (!el) return {} as CSSStyleDeclaration;
    const result = originalGetComputedStyle(el as Element, pseudo ?? null);
    return (result || {}) as CSSStyleDeclaration;
  };
}

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
// NOTE:
// We must not completely replace document.createElement globally with a mock that
// returns plain objects, because ReactDOM (and ReactDOM internals like
// getVendorPrefixedEventName) rely on real Elements with a `style` object.
// Instead:
// - Keep the original implementation for all tags by default.
// - Special-case only what our tests need (e.g. <a>) while preserving element shape.
const __originalCreateElement = document.createElement.bind(document);

Object.defineProperty(document, 'createElement', {
 writable: true,
 configurable: true,
 value: vi.fn((tagName: string, options?: any) => {
   if (tagName === 'a') {
     // Create a real anchor element and patch what tests assert on.
     const a = __originalCreateElement('a', options) as HTMLAnchorElement;
     Object.defineProperty(a, 'click', {
       value: vi.fn(),
       writable: true,
     });
     return a;
   }

   // Fallback: real DOM element so React can safely read .style, etc.
   return __originalCreateElement(tagName, options);
 }),
});


// Mock crypto for Node.js compatibility
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn(),
    subtle: {},
  },
  writable: true,
});