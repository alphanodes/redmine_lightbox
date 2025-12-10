/* global GLightbox, Map */

(function() {
  'use strict';

  // File extension regex matching on supported image types
  const extensionRegexImage = /\.(png|jpe?g|gif|bmp)$/i;

  // Store lightbox instance globally to destroy and recreate after AJAX
  let lightboxInstance = null;
  
  function parseAttachmentIdFromUrl(url) {
    const match = url.match(/\/attachments\/(?:download\/)?(\d+)(?:\/|$)/);
    return match ? match[1] : null;
  }

  function initializeLightbox() {
    // Collect all lightbox links (images and PDFs) in DOM order for unified slideshow
    const allLightboxLinks = [];
    const seenHrefs = new Map(); // For deduplication

    // Helper to add link if not duplicate
    function addLightboxLink(link) {
      const href = link.href;
      if (!seenHrefs.has(href)) {
        seenHrefs.set(href, true);
        allLightboxLinks.push(link);
      }
    }

    // Collect image links
    const imageSelectors = [
      'div.attachments a.lightbox:not(.pdf)',
      'div.attachments a.lightbox-preview',
      'table.list.files a.icon-magnifier:not([href$=".pdf"])',
      '.controller-dmsf #browser a.lightbox',
      'table.list.files td.filename a.lightbox:not(.pdf)'
    ];

    imageSelectors.forEach(function(selector) {
      document.querySelectorAll(selector).forEach(addLightboxLink);
    });

    // Add journal detail links that match image regex
    document.querySelectorAll('div.journal ul.journal-details a:not(.icon-download)').forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && href.match(extensionRegexImage)) {
        addLightboxLink(link);
      }
    });

    // Add journal thumbnails that are images
    document.querySelectorAll('div.journal div.thumbnails a').forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && href.match(extensionRegexImage)) {
        addLightboxLink(link);
      }
    });

    // Add wiki thumbnails that are images
    document.querySelectorAll('div.wiki a.thumbnail').forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && href.match(extensionRegexImage)) {
        addLightboxLink(link);
      }
    });

    // Add avatar links (contact photos, user avatars) that point to image attachments
    document.querySelectorAll('a[href*="/attachments/"]').forEach(function(link) {
      const img = link.querySelector('img.avatar');
      const href = link.getAttribute('href');
      if (img && href && href.match(extensionRegexImage)) {
        // Convert /attachments/{id}/{filename} to /attachments/thumbnail/{id}/400
        // This handles Contacts plugin avatar links that point to HTML detail pages
        const thumbnailMatch = href.match(/\/attachments\/(\d+)\//);
        if (thumbnailMatch) {
          const attachmentId = thumbnailMatch[1];
          // Rewrite href to use 400px thumbnail instead of detail page
          link.href = '/attachments/thumbnail/' + attachmentId + '/400';
        }
        addLightboxLink(link);
      }
    });

    // Collect PDF links
    const pdfSelectors = [
      'div.attachments a.pdf',
      'table.list.files td.filename a.lightbox.pdf',
      'table.list.files a.icon-magnifier[href$=".pdf"]'
    ];

    pdfSelectors.forEach(function(selector) {
      document.querySelectorAll(selector).forEach(addLightboxLink);
    });

    // Add journal detail and thumbnail links that match PDF regex
    document.querySelectorAll('div.journal ul.journal-details a:not(.icon-download)').forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && href.match(/\.pdf$/i)) {
        addLightboxLink(link);
      }
    });

    document.querySelectorAll('div.journal div.thumbnails a').forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && href.match(/\.pdf$/i)) {
        addLightboxLink(link);
      }
    });

    // Build unified elements array for GLightbox
    if (allLightboxLinks.length > 0) {
      const elements = [];

      allLightboxLinks.forEach(function(link) {
        const href = link.href;
        const isPdf = href.match(/\.pdf$/i);

        if (isPdf) {
          // PDF: use iframe content
          elements.push({
            content: '<iframe src="' + href + '" style="width: 90vw; height: 90vh; border: none;"></iframe>',
            width: '90vw',
            height: '90vh'
          });
        } else {
          // Image: use href
          elements.push({
            href: href,
            type: 'image'
          });
        }
      });

      // Destroy previous instance if exists
      if (lightboxInstance) {
        lightboxInstance.destroy();
      }

      // Create single GLightbox instance for all media
      lightboxInstance = GLightbox({
        elements: elements,
        touchNavigation: true,
        loop: true,
        zoomable: true,
        draggable: true,
        closeOnOutsideClick: true
      });

      // Attach click handlers directly to lightbox links (efficient)
      allLightboxLinks.forEach(function(link, index) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          lightboxInstance.openAt(index);
        });
      });

      // Handle duplicate links (same href as lightbox link)
      const allLinks = document.querySelectorAll('a[href]');
      allLinks.forEach(function(link) {
        const attachmentId = parseAttachmentIdFromUrl(link.href);
        if (!attachmentId) return;
        // Check if this link is NOT already in allLightboxLinks but has same href
        const isInLightboxLinks = allLightboxLinks.some(function(lbLink) {
          return lbLink === link;
        });

        if (!isInLightboxLinks) {
          // Skip download icons
          if (link.classList.contains('icon-download')) {
            return;
          }

          // Find index in our unique list
          const index = allLightboxLinks.findIndex(function (l) {
            return parseAttachmentIdFromUrl(l.href) === attachmentId;
          });

          if (index !== -1) {
            link.addEventListener('click', function(e) {
              e.preventDefault();
              lightboxInstance.openAt(index);
            });
          }
        }
      });
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initializeLightbox);

  // Re-initialize after AJAX content is loaded (for tabs, etc.)
  document.addEventListener('ajax:complete', function() {
    // Use setTimeout to ensure DOM is updated before initializing
    setTimeout(initializeLightbox, 100);
  });

  // Re-initialize after jQuery UI tabs are activated (Redmine uses jQuery UI tabs)
  // Use event delegation on document since tabs might not exist yet
  if (typeof jQuery !== 'undefined') {
    jQuery(document).on('tabsactivate', function() {
      setTimeout(initializeLightbox, 100);
    });
  }

  // Fallback: Observe DOM changes for dynamically loaded content
  // This catches AJAX-loaded tabs that don't fire proper events
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // Check if new nodes were added with lightbox links
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            const hasLightboxLinks = node.querySelector && node.querySelector('a.lightbox');
            if (hasLightboxLinks) {
              setTimeout(initializeLightbox, 100);
            }
          }
        });
      }
    });
  });

  // Observe changes to #history container (where tabs load content)
  document.addEventListener('DOMContentLoaded', function() {
    const historyContainer = document.getElementById('history');
    if (historyContainer) {
      observer.observe(historyContainer, {
        childList: true,
        subtree: true
      });
    }
  });
})();
