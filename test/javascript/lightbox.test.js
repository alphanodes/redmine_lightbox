import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../../assets/javascripts/lightbox.js';

describe('RedmineLightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    GLightbox.mockClear();
    window.RedmineLightbox._reset();
  });

  // ── collectAllLinks ─────────────────────────────────────────────────
  describe('collectAllLinks', () => {
    it('finds attachment image links', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/1/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
      expect(links[0].textContent).toBe('photo.jpg');
    });

    it('finds lightbox-preview links', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/1/photo.png" class="lightbox-preview">
            <img src="thumb.png">
          </a>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('excludes PDF links from image selectors', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/1/photo.jpg" class="lightbox">photo.jpg</a>
          <a href="http://localhost/attachments/2/doc.pdf" class="lightbox pdf">doc.pdf</a>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(2);
    });

    it('finds PDF links', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/1/doc.pdf" class="pdf">doc.pdf</a>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('deduplicates links with same href', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/1/photo.jpg" class="lightbox">photo.jpg</a>
          <div class="thumbnails">
            <a href="http://localhost/attachments/1/photo.jpg">
              <img src="thumb.jpg">
            </a>
          </div>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('finds wiki thumbnail links', () => {
      document.body.innerHTML = `
        <div class="wiki">
          <a href="http://localhost/attachments/1/diagram.png" class="thumbnail">
            <img src="thumb.png">
          </a>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('finds journal detail image links', () => {
      document.body.innerHTML = `
        <div class="journal">
          <ul class="journal-details">
            <li><a href="http://localhost/attachments/1/screenshot.png">screenshot.png</a></li>
          </ul>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('excludes download links from journal details', () => {
      document.body.innerHTML = `
        <div class="journal">
          <ul class="journal-details">
            <li><a href="http://localhost/attachments/download/1/photo.jpg" class="icon-download">photo.jpg</a></li>
          </ul>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(0);
    });

    it('finds journal thumbnail links', () => {
      document.body.innerHTML = `
        <div class="journal">
          <div class="thumbnails">
            <a href="http://localhost/attachments/1/photo.gif">
              <img src="thumb.gif">
            </a>
          </div>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('finds journal PDF links', () => {
      document.body.innerHTML = `
        <div class="journal">
          <ul class="journal-details">
            <li><a href="http://localhost/attachments/1/report.pdf">report.pdf</a></li>
          </ul>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('finds journal WebP image links', () => {
      document.body.innerHTML = `
        <div class="journal">
          <ul class="journal-details">
            <li><a href="http://localhost/attachments/1/photo.webp">photo.webp</a></li>
          </ul>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('finds journal TIFF image links', () => {
      document.body.innerHTML = `
        <div class="journal">
          <ul class="journal-details">
            <li><a href="http://localhost/attachments/1/scan.tiff">scan.tiff</a></li>
          </ul>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('rewrites avatar attachment URLs to thumbnails', () => {
      document.body.innerHTML = `
        <a href="http://localhost/attachments/42/avatar.jpg">
          <img class="avatar" src="thumb.jpg">
        </a>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
      expect(links[0].href).toContain('/attachments/thumbnail/42/400');
    });

    it('does not rewrite avatar links without attachment ID pattern', () => {
      document.body.innerHTML = `
        <a href="http://localhost/other/avatar.jpg">
          <img class="avatar" src="thumb.jpg">
        </a>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(0);
    });

    it('ignores links without image avatar', () => {
      document.body.innerHTML = `
        <a href="http://localhost/attachments/42/avatar.jpg">
          <img src="thumb.jpg">
        </a>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(0);
    });

    it('finds file module magnifier links', () => {
      document.body.innerHTML = `
        <table class="list files">
          <tbody>
            <tr>
              <td><a href="http://localhost/attachments/1/photo.jpg" class="icon-magnifier">photo.jpg</a></td>
            </tr>
          </tbody>
        </table>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('finds file module PDF magnifier links', () => {
      document.body.innerHTML = `
        <table class="list files">
          <tbody>
            <tr>
              <td><a href="http://localhost/attachments/1/doc.pdf" class="icon-magnifier">doc.pdf</a></td>
            </tr>
          </tbody>
        </table>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('finds DMSF browser links', () => {
      document.body.innerHTML = `
        <div class="controller-dmsf">
          <div id="browser">
            <a href="http://localhost/dmsf/1/photo.jpg" class="lightbox">photo.jpg</a>
          </div>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(1);
    });

    it('ignores non-image links in dynamic selectors', () => {
      document.body.innerHTML = `
        <div class="wiki">
          <a href="http://localhost/wiki/page" class="thumbnail">Not an image</a>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(0);
    });

    it('returns empty array when no links found', () => {
      document.body.innerHTML = '<div>No attachments here</div>';
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(0);
    });

    it('collects images and PDFs in DOM order', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/1/photo.jpg" class="lightbox">photo.jpg</a>
          <a href="http://localhost/attachments/2/doc.pdf" class="pdf">doc.pdf</a>
          <a href="http://localhost/attachments/3/logo.png" class="lightbox">logo.png</a>
        </div>
      `;
      const links = window.RedmineLightbox.collectAllLinks();
      expect(links).toHaveLength(3);
      expect(links[0].textContent).toBe('photo.jpg');
      expect(links[1].textContent).toBe('logo.png');
      expect(links[2].textContent).toBe('doc.pdf');
    });
  });

  // ── buildElements ───────────────────────────────────────────────────
  describe('buildElements', () => {
    it('creates image element for image link', () => {
      document.body.innerHTML = '<a href="http://localhost/photo.jpg">photo</a>';
      const link = document.querySelector('a');
      const elements = window.RedmineLightbox.buildElements([link]);
      expect(elements).toHaveLength(1);
      expect(elements[0]).toEqual({href: 'http://localhost/photo.jpg', type: 'image', title: 'photo.jpg'});
    });

    it('creates iframe element for PDF link', () => {
      document.body.innerHTML = '<a href="http://localhost/doc.pdf">doc</a>';
      const link = document.querySelector('a');
      const elements = window.RedmineLightbox.buildElements([link]);
      expect(elements).toHaveLength(1);
      expect(elements[0].content).toContain('<iframe');
      expect(elements[0].content).toContain('doc.pdf');
      expect(elements[0].width).toBe('90vw');
      expect(elements[0].height).toBe('90vh');
    });

    it('handles mixed images and PDFs', () => {
      document.body.innerHTML = `
        <a id="img" href="http://localhost/photo.jpg">photo</a>
        <a id="pdf" href="http://localhost/doc.pdf">doc</a>
      `;
      const links = [document.getElementById('img'), document.getElementById('pdf')];
      const elements = window.RedmineLightbox.buildElements(links);
      expect(elements).toHaveLength(2);
      expect(elements[0].type).toBe('image');
      expect(elements[1].content).toContain('<iframe');
    });

    it('returns empty array for empty input', () => {
      const elements = window.RedmineLightbox.buildElements([]);
      expect(elements).toHaveLength(0);
    });
  });

  // ── initializeLightbox ──────────────────────────────────────────────
  describe('initializeLightbox', () => {
    it('initializes GLightbox when links are found', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      expect(GLightbox).toHaveBeenCalledTimes(1);
      expect(GLightbox).toHaveBeenCalledWith(expect.objectContaining({
        touchNavigation: true,
        loop: true,
        zoomable: true,
        draggable: true,
        closeOnOutsideClick: true
      }));
    });

    it('passes correct elements to GLightbox', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
          <a href="http://localhost/doc.pdf" class="pdf">doc.pdf</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const callArgs = GLightbox.mock.calls[0][0];
      expect(callArgs.elements).toHaveLength(2);
      expect(callArgs.elements[0].type).toBe('image');
      expect(callArgs.elements[1].content).toContain('<iframe');
    });

    it('does not initialize GLightbox when no links found', () => {
      document.body.innerHTML = '<div>No attachments</div>';
      window.RedmineLightbox.initializeLightbox();
      expect(GLightbox).not.toHaveBeenCalled();
    });

    it('destroys previous instance before creating new one', () => {
      const mockDestroy = vi.fn();
      GLightbox.mockReturnValue({destroy: mockDestroy, openAt: vi.fn()});

      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;

      window.RedmineLightbox.initializeLightbox();
      expect(GLightbox).toHaveBeenCalledTimes(1);

      window.RedmineLightbox.initializeLightbox();
      expect(mockDestroy).toHaveBeenCalledTimes(1);
      expect(GLightbox).toHaveBeenCalledTimes(2);
    });
  });

  // ── click handling (integration tests) ──────────────────────────────
  // These test the full flow: initializeLightbox() + click events.
  // They serve as safety net during refactoring (handler delegation, etc.)
  describe('click handling', () => {
    beforeEach(() => {
      GLightbox.mockReturnValue({destroy: vi.fn(), openAt: vi.fn()});
    });

    it('clicking lightbox link opens at correct index', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/a.jpg" class="lightbox">A</a>
          <a href="http://localhost/b.jpg" class="lightbox">B</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      const link = document.querySelectorAll('a.lightbox')[1];
      link.dispatchEvent(new Event('click', {cancelable: true, bubbles: true}));

      expect(instance.openAt).toHaveBeenCalledWith(1);
    });

    it('clicking first lightbox link opens at index 0', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      const link = document.querySelector('a.lightbox');
      link.dispatchEvent(new Event('click', {cancelable: true, bubbles: true}));

      expect(instance.openAt).toHaveBeenCalledWith(0);
    });

    it('clicking lightbox link prevents default navigation', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();

      const link = document.querySelector('a.lightbox');
      const event = new Event('click', {cancelable: true, bubbles: true});
      link.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('clicking duplicate link opens lightbox at matching index', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
        <div class="other">
          <a id="dup" href="http://localhost/photo.jpg">same photo</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      const dup = document.getElementById('dup');
      dup.dispatchEvent(new Event('click', {cancelable: true, bubbles: true}));

      expect(instance.openAt).toHaveBeenCalledWith(0);
    });

    it('clicking download link does not open lightbox', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
        <a id="dl" href="http://localhost/photo.jpg" class="icon-download">Download</a>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      const dl = document.getElementById('dl');
      dl.dispatchEvent(new Event('click', {cancelable: true, bubbles: true}));

      expect(instance.openAt).not.toHaveBeenCalled();
    });

    it('clicking non-lightbox link does not open lightbox', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
        <a id="other" href="http://localhost/other-page.html">other page</a>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      const other = document.getElementById('other');
      other.dispatchEvent(new Event('click', {cancelable: true, bubbles: true}));

      expect(instance.openAt).not.toHaveBeenCalled();
    });

    it('clicking child element inside lightbox link opens lightbox', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">
            <img id="thumb" src="thumb.jpg">
          </a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      const img = document.getElementById('thumb');
      img.dispatchEvent(new Event('click', {cancelable: true, bubbles: true}));

      expect(instance.openAt).toHaveBeenCalledWith(0);
    });

    // This test verifies the handler stacking fix (Punkt 5).
    // Multiple initializeLightbox calls must NOT result in multiple openAt calls.
    it('does not stack handlers on multiple initializations', () => {
      const openAtCalls = [];
      GLightbox.mockImplementation(() => ({
        destroy: vi.fn(),
        openAt: vi.fn((idx) => openAtCalls.push(idx))
      }));

      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;

      window.RedmineLightbox.initializeLightbox();
      window.RedmineLightbox.initializeLightbox();
      window.RedmineLightbox.initializeLightbox();

      const link = document.querySelector('a.lightbox');
      link.dispatchEvent(new Event('click', {cancelable: true, bubbles: true}));

      expect(openAtCalls).toHaveLength(1);
      expect(openAtCalls[0]).toBe(0);
    });
  });

  // ── parseAttachmentId ───────────────────────────────────────────────
  describe('parseAttachmentId', () => {
    it('extracts ID from canonical attachment URL', () => {
      expect(window.RedmineLightbox.parseAttachmentId('http://localhost/attachments/42/photo.jpg')).toBe(42);
    });

    it('extracts ID from download URL', () => {
      expect(window.RedmineLightbox.parseAttachmentId('http://localhost/attachments/download/7/file.pdf')).toBe(7);
    });

    it('extracts ID from thumbnail URL', () => {
      expect(window.RedmineLightbox.parseAttachmentId('http://localhost/attachments/thumbnail/15/400')).toBe(15);
    });

    it('returns null for non-attachment URLs', () => {
      expect(window.RedmineLightbox.parseAttachmentId('http://localhost/issues/1')).toBeNull();
    });

    it('returns null for null or empty input', () => {
      expect(window.RedmineLightbox.parseAttachmentId(null)).toBeNull();
      expect(window.RedmineLightbox.parseAttachmentId('')).toBeNull();
    });
  });

  // ── extractCaption ──────────────────────────────────────────────────
  describe('extractCaption', () => {
    it('uses data-caption when present', () => {
      document.body.innerHTML = '<a href="http://localhost/attachments/1/x.jpg" data-caption="My Title">x</a>';
      const link = document.querySelector('a');
      expect(window.RedmineLightbox.extractCaption(link)).toBe('My Title');
    });

    it('falls back to filename derived from URL', () => {
      document.body.innerHTML = '<a href="http://localhost/attachments/1/diagram.png">x</a>';
      const link = document.querySelector('a');
      expect(window.RedmineLightbox.extractCaption(link)).toBe('diagram.png');
    });

    it('decodes URL-encoded filenames', () => {
      document.body.innerHTML = '<a href="http://localhost/attachments/1/Bildschirm%20Foto.png">x</a>';
      const link = document.querySelector('a');
      expect(window.RedmineLightbox.extractCaption(link)).toBe('Bildschirm Foto.png');
    });
  });

  // ── buildElements with caption ──────────────────────────────────────
  describe('buildElements with caption', () => {
    it('sets title from data-caption for image', () => {
      document.body.innerHTML = '<a href="http://localhost/attachments/1/photo.jpg" data-caption="Holiday">photo</a>';
      const link = document.querySelector('a');
      const elements = window.RedmineLightbox.buildElements([link]);
      expect(elements[0].title).toBe('Holiday');
    });

    it('sets title from filename when no data-caption', () => {
      document.body.innerHTML = '<a href="http://localhost/attachments/1/photo.jpg">photo</a>';
      const link = document.querySelector('a');
      const elements = window.RedmineLightbox.buildElements([link]);
      expect(elements[0].title).toBe('photo.jpg');
    });

    it('sets title for PDF elements', () => {
      document.body.innerHTML = '<a href="http://localhost/attachments/1/manual.pdf" data-caption="User Manual">pdf</a>';
      const link = document.querySelector('a');
      const elements = window.RedmineLightbox.buildElements([link]);
      expect(elements[0].title).toBe('User Manual');
      expect(elements[0].content).toContain('<iframe');
    });
  });

  // ── URL query parameter ─────────────────────────────────────────────
  describe('URL query parameter', () => {
    beforeEach(() => {
      // Reset URL to a clean state
      window.history.replaceState({}, '', 'http://localhost/issues/1');
      // Restore full GLightbox mock — earlier describe blocks override it
      GLightbox.mockImplementation(() => ({
        destroy: vi.fn(),
        openAt: vi.fn(),
        close: vi.fn(),
        on: vi.fn(),
        goToSlide: vi.fn(),
        getActiveSlideIndex: vi.fn(() => 0)
      }));
    });

    it('opens lightbox automatically when ?lightbox= matches an attachment ID', () => {
      window.history.replaceState({}, '', 'http://localhost/issues/1?lightbox=42');
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/42/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      expect(instance.openAt).toHaveBeenCalledWith(0);
    });

    it('strips ?lightbox= from URL when ID is not on the page', () => {
      window.history.replaceState({}, '', 'http://localhost/issues/1?lightbox=999');
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/42/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      expect(instance.openAt).not.toHaveBeenCalled();
      expect(window.location.search).toBe('');
    });

    it('ignores non-numeric ?lightbox= values', () => {
      window.history.replaceState({}, '', 'http://localhost/issues/1?lightbox=abc');
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/42/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      expect(instance.openAt).not.toHaveBeenCalled();
    });

    it('registers slide_changed handler on lightbox instance', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/42/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const instance = GLightbox.mock.results[0].value;

      expect(instance.on).toHaveBeenCalledWith('slide_changed', expect.any(Function));
    });

    it('configures onOpen callback', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/42/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const config = GLightbox.mock.calls[0][0];

      expect(typeof config.onOpen).toBe('function');
      expect(typeof config.onClose).toBe('function');
    });

    it('writes ?lightbox=ID to URL when slide opens', () => {
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/42/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const config = GLightbox.mock.calls[0][0];

      // Simulate GLightbox calling onOpen
      config.onOpen();

      expect(window.location.search).toBe('?lightbox=42');
    });

    it('removes ?lightbox= from URL when slide closes', () => {
      window.history.replaceState({}, '', 'http://localhost/issues/1?lightbox=42');
      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/attachments/42/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;
      window.RedmineLightbox.initializeLightbox();
      const config = GLightbox.mock.calls[0][0];

      config.onClose();

      expect(window.location.search).toBe('');
    });
  });

  // ── debounce ────────────────────────────────────────────────────────
  describe('debounce', () => {
    it('coalesces rapid debouncedInit calls into single execution', () => {
      vi.useFakeTimers();

      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;

      for (let i = 0; i < 5; i++) {
        window.RedmineLightbox.debouncedInit();
      }

      expect(GLightbox).not.toHaveBeenCalled();

      vi.advanceTimersByTime(150);
      expect(GLightbox).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('resets timer on each call so only last one fires', () => {
      vi.useFakeTimers();

      document.body.innerHTML = `
        <div class="attachments">
          <a href="http://localhost/photo.jpg" class="lightbox">photo.jpg</a>
        </div>
      `;

      window.RedmineLightbox.debouncedInit();
      vi.advanceTimersByTime(80);

      window.RedmineLightbox.debouncedInit();
      vi.advanceTimersByTime(80);

      // 160ms total but timer was reset at 80ms, so still waiting
      expect(GLightbox).not.toHaveBeenCalled();

      vi.advanceTimersByTime(70);
      expect(GLightbox).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
