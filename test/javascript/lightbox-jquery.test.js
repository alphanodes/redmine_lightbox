import { describe, it, expect, beforeEach, vi } from 'vitest';

// The plugin registers its jQuery handlers on load, so jQuery has to exist before the import
const handlers = {};
globalThis.jQuery = () => ({
  on(events, handler) {
    events.split(' ').forEach((event) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(handler);
    });
  },
});

await import('../../assets/javascripts/lightbox.js');

const LINK = (id) => `<a href="http://localhost/attachments/${id}" class="thumbnail" title="${id}.png"><img alt="${id}.png"></a>`;

function triggerAjaxComplete() {
  handlers.ajaxComplete.forEach((handler) => handler());
  vi.advanceTimersByTime(150); // initialization is debounced by 100ms
}

describe('jQuery ajaxComplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `<div class="wiki">${LINK(1)}</div>`;
    GLightbox.mockClear();
    window.RedmineLightbox._reset();
    window.RedmineLightbox.initializeLightbox();
    GLightbox.mockClear();
  });

  it('rebuilds the lightbox when a request added links', () => {
    document.body.innerHTML = `<div class="wiki">${LINK(1)}</div><div class="wiki wiki-preview">${LINK(2)}</div>`;
    triggerAjaxComplete();

    expect(GLightbox).toHaveBeenCalledTimes(1);
    expect(GLightbox.mock.calls[0][0].elements).toHaveLength(2);
    vi.useRealTimers();
  });

  it('keeps the lightbox when the links did not change, e.g. while it is open', () => {
    triggerAjaxComplete();

    expect(GLightbox).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
