/* global GLightbox */

(function() {
  'use strict';

  const IMAGE_EXTENSION_REGEX = /\.(png|jpe?g|gif|bmp)$/i;
  const PDF_EXTENSION_REGEX = /\.pdf$/i;

  const IMAGE_SELECTORS = [
    'div.attachments a.lightbox:not(.pdf)',
    'div.attachments a.lightbox-preview',
    'table.list.files a.icon-magnifier:not([href$=".pdf"])',
    '.controller-dmsf #browser a.lightbox',
    'table.list.files td.filename a.lightbox:not(.pdf)'
  ];

  const PDF_SELECTORS = [
    'div.attachments a.pdf',
    'table.list.files td.filename a.lightbox.pdf',
    'table.list.files a.icon-magnifier[href$=".pdf"]'
  ];

  const DYNAMIC_LINK_SELECTORS = [
    'div.journal ul.journal-details a:not(.icon-download)',
    'div.journal div.thumbnails a',
    'div.attachments div.thumbnails a',
    'div.wiki a.thumbnail'
  ];

  let lightboxInstance = null;

  // Map href → index for O(1) click delegation lookup
  let hrefIndexMap = new Map();

  // Collect all lightbox links (images and PDFs) in DOM order, deduplicated
  function collectAllLinks() {
    const allLinks = [];
    const seenHrefs = new Set();

    function addLink(link) {
      const {href} = link;
      if (!seenHrefs.has(href)) {
        seenHrefs.add(href);
        allLinks.push(link);
      }
    }

    // Static image selectors
    IMAGE_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach(addLink);
    });

    // Dynamic links: single pass for both images and PDFs (Punkt 1)
    DYNAMIC_LINK_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((link) => {
        const href = link.getAttribute('href');
        if (href && (IMAGE_EXTENSION_REGEX.test(href) || PDF_EXTENSION_REGEX.test(href))) {
          addLink(link);
        }
      });
    });

    // Avatar links (contact photos, user avatars) that point to image attachments
    document.querySelectorAll('a[href*="/attachments/"]').forEach((link) => {
      const img = link.querySelector('img.avatar');
      const href = link.getAttribute('href');
      if (img && href && IMAGE_EXTENSION_REGEX.test(href)) {
        // Convert /attachments/{id}/{filename} to /attachments/thumbnail/{id}/400
        const thumbnailMatch = href.match(/\/attachments\/(\d+)\//);
        if (thumbnailMatch) {
          link.href = `/attachments/thumbnail/${thumbnailMatch[1]}/400`;
        }
        addLink(link);
      }
    });

    // Static PDF selectors
    PDF_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach(addLink);
    });

    return allLinks;
  }

  // Build GLightbox elements array from collected links
  function buildElements(links) {
    return links.map((link) => {
      const {href} = link;
      if (PDF_EXTENSION_REGEX.test(href)) {
        return {
          content: `<iframe src="${href}" style="width: 90vw; height: 90vh; border: none;"></iframe>`,
          width: '90vw',
          height: '90vh'
        };
      }
      return {href, type: 'image'};
    });
  }

  // Event delegation: single click handler on document (Punkt 5)
  // Registered once, uses hrefIndexMap for O(1) lookup.
  let delegationInstalled = false;

  function handleDelegatedClick(e) {
    if (!lightboxInstance) { return; }

    const link = e.target.closest('a[href]');
    if (!link || link.classList.contains('icon-download')) { return; }

    const index = hrefIndexMap.get(link.href);
    if (index !== undefined) {
      e.preventDefault();
      lightboxInstance.openAt(index);
    }
  }

  function setupDelegation() {
    if (delegationInstalled) { return; }
    document.addEventListener('click', handleDelegatedClick, false);
    delegationInstalled = true;
  }

  // Build href → index map from collected links (Punkt 2 + 5)
  function updateLinkMap(links) {
    hrefIndexMap = new Map();
    links.forEach((link, index) => {
      const {href} = link;
      if (!hrefIndexMap.has(href)) {
        hrefIndexMap.set(href, index);
      }
    });
  }

  function initializeLightbox() {
    const allLinks = collectAllLinks();
    if (allLinks.length === 0) { return; }

    const elements = buildElements(allLinks);

    if (lightboxInstance) {
      lightboxInstance.destroy();
    }

    lightboxInstance = GLightbox({
      elements,
      touchNavigation: true,
      loop: true,
      zoomable: true,
      draggable: true,
      closeOnOutsideClick: true
    });

    updateLinkMap(allLinks);
    setupDelegation();
  }

  // Debounce helper (Punkt 3)
  function debounce(fn, delay) {
    let timer = null;
    return function() {
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(fn, delay);
    };
  }

  const debouncedInit = debounce(initializeLightbox, 100);

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initializeLightbox);

  // Re-initialize after AJAX / tab changes via debounced handler (Punkt 3 + 4)
  document.addEventListener('ajax:complete', debouncedInit);

  if (typeof jQuery !== 'undefined') {
    jQuery(document).on('tabsactivate', debouncedInit);
  }

  // Fallback: Observe DOM changes for dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    const hasNewLinks = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        return node.nodeType === 1 && node.querySelector && node.querySelector('a.lightbox');
      });
    });
    if (hasNewLinks) {
      debouncedInit();
    }
  });

  // Observe changes to tab containers (where tabs load content)
  document.addEventListener('DOMContentLoaded', () => {
    const containers = ['history', 'user-history'];
    containers.forEach((id) => {
      const container = document.getElementById(id);
      if (container) {
        observer.observe(container, {childList: true, subtree: true});
      }
    });
  });

  // Expose internals for testing
  window.RedmineLightbox = {
    collectAllLinks,
    buildElements,
    initializeLightbox,
    debouncedInit,
    _reset() {
      lightboxInstance = null;
      hrefIndexMap = new Map();
    }
  };
})();
