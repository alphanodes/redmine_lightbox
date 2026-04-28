/* global GLightbox */

(function() {
  'use strict';

  const IMAGE_EXTENSION_REGEX = /\.(png|jpe?g|jpe|gif|bmp|tiff?|webp)$/i;
  const PDF_EXTENSION_REGEX = /\.pdf$/i;
  const ATTACHMENT_ID_REGEX = /\/attachments\/(?:(?:download|thumbnail)\/)?(\d+)(?:\/|$)/;
  const URL_PARAM = 'lightbox';

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

  // Map attachmentId ↔ index for URL query parameter sync
  let idIndexMap = new Map();
  let indexIdMap = new Map();

  // History/state flags for URL sync
  let isLightboxOpen = false;
  let isHistoryNavigation = false;
  let isClosingFromPopstate = false;
  let initialUrlChecked = false;

  // Extract numeric attachment ID from a Redmine attachment URL.
  function parseAttachmentId(href) {
    const match = href && href.match(ATTACHMENT_ID_REGEX);
    return match ? Number.parseInt(match[1], 10) : null;
  }

  // Best-effort caption: prefer data-caption from LightboxHelper,
  // fall back to filename derived from URL path.
  function extractCaption(link) {
    if (link.dataset && link.dataset.caption) { return link.dataset.caption; }
    try {
      const url = new URL(link.href);
      return decodeURIComponent(url.pathname.split('/').pop()) || '';
    } catch {
      return '';
    }
  }

  function getLightboxIdFromUrl() {
    const value = new URLSearchParams(window.location.search).get(URL_PARAM);
    if (!value || !/^\d+$/.test(value)) { return null; }
    return Number.parseInt(value, 10);
  }

  function updateUrlParam(id, mode) {
    const url = new URL(window.location);
    if (id === null || id === undefined) {
      if (!url.searchParams.has(URL_PARAM)) { return; }
      url.searchParams.delete(URL_PARAM);
    } else {
      url.searchParams.set(URL_PARAM, String(id));
    }
    if (mode === 'push') {
      window.history.pushState({}, '', url);
    } else {
      window.history.replaceState({}, '', url);
    }
  }

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
      const title = extractCaption(link);
      if (PDF_EXTENSION_REGEX.test(href)) {
        return {
          content: `<iframe src="${href}" style="width: 90vw; height: 90vh; border: none;"></iframe>`,
          width: '90vw',
          height: '90vh',
          title
        };
      }
      return {href, type: 'image', title};
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

  // Build href → index map from collected links (Punkt 2 + 5).
  // Also build attachmentId ↔ index maps used for URL query sync.
  function updateLinkMap(links) {
    hrefIndexMap = new Map();
    idIndexMap = new Map();
    indexIdMap = new Map();
    links.forEach((link, index) => {
      const {href} = link;
      if (!hrefIndexMap.has(href)) {
        hrefIndexMap.set(href, index);
      }
      const id = parseAttachmentId(href);
      if (id !== null && !idIndexMap.has(id)) {
        idIndexMap.set(id, index);
        indexIdMap.set(index, id);
      }
    });
  }

  function handlePopState() {
    if (!lightboxInstance) { return; }
    isHistoryNavigation = true;

    const id = getLightboxIdFromUrl();
    if (id === null) {
      if (isLightboxOpen) {
        isClosingFromPopstate = true;
        lightboxInstance.close();
      }
      return;
    }

    const index = idIndexMap.get(id);
    if (index === undefined) {
      updateUrlParam(null, 'replace');
      return;
    }

    if (isLightboxOpen) {
      lightboxInstance.goToSlide(index);
    } else {
      lightboxInstance.openAt(index);
    }
  }

  let popstateInstalled = false;
  function setupHistoryListener() {
    if (popstateInstalled) { return; }
    window.addEventListener('popstate', handlePopState);
    popstateInstalled = true;
  }

  function openFromUrlIfPresent() {
    if (initialUrlChecked) { return; }
    initialUrlChecked = true;

    const id = getLightboxIdFromUrl();
    if (id === null) { return; }

    const index = idIndexMap.get(id);
    if (index !== undefined) {
      lightboxInstance.openAt(index);
    } else {
      updateUrlParam(null, 'replace');
    }
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
      closeOnOutsideClick: true,
      onOpen: () => {
        isLightboxOpen = true;
        const index = lightboxInstance.getActiveSlideIndex
          ? lightboxInstance.getActiveSlideIndex()
          : 0;
        const id = indexIdMap.get(index);
        if (id !== undefined) {
          updateUrlParam(id, isHistoryNavigation ? 'replace' : 'push');
        }
        isHistoryNavigation = false;
      },
      onClose: () => {
        isLightboxOpen = false;
        if (!isClosingFromPopstate) {
          updateUrlParam(null, 'push');
        }
        isClosingFromPopstate = false;
      }
    });

    if (typeof lightboxInstance.on === 'function') {
      lightboxInstance.on('slide_changed', (data) => {
        const current = data && data.current;
        if (!current) { return; }
        const id = indexIdMap.get(current.index);
        if (id !== undefined) {
          updateUrlParam(id, 'replace');
        }
      });
    }

    updateLinkMap(allLinks);
    setupDelegation();
    setupHistoryListener();
    openFromUrlIfPresent();
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
    parseAttachmentId,
    extractCaption,
    _reset() {
      lightboxInstance = null;
      hrefIndexMap = new Map();
      idIndexMap = new Map();
      indexIdMap = new Map();
      isLightboxOpen = false;
      isHistoryNavigation = false;
      isClosingFromPopstate = false;
      initialUrlChecked = false;
    }
  };
})();
