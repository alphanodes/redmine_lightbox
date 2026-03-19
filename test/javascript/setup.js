import { vi } from 'vitest';

// Mock GLightbox library (normally loaded via script tag)
globalThis.GLightbox = vi.fn(() => ({
  destroy: vi.fn(),
  openAt: vi.fn(),
  close: vi.fn()
}));

// jQuery is not available in test environment
globalThis.jQuery = undefined;
