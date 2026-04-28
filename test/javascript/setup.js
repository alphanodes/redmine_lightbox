import { vi } from 'vitest';

// Mock GLightbox library (normally loaded via script tag)
globalThis.GLightbox = vi.fn(() => ({
  destroy: vi.fn(),
  openAt: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
  goToSlide: vi.fn(),
  getActiveSlideIndex: vi.fn(() => 0)
}));

// jQuery is not available in test environment
globalThis.jQuery = undefined;
