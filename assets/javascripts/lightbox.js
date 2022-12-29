$(function() {
  // the file extension regex matching on supported image and pdf types
  var extensionRegexImage = /\.(png|jpe?g|gif|bmp)$/i;
  var extensionRegexAll = /\.(png|jpe?g|gif|bmp|pdf)$/i;

  // used be thumbnail macro
  $('div.wiki a.thumbnail').each(function() {
    var relgroup = 'thumbnail-macro';
    var href = $(this).attr('href');
    var filename = $(this).text();
    var title = $(this).attr('title');
    $(this)
      .attr('href', href.replace(/\/attachments\/(\d+)/g,'/attachments/download/$1/' + filename))
      .attr('rel', relgroup)
      .attr('data-fancybox', relgroup)
      .attr('data-caption', title);
  });

  // add rel attribute to thumbnails of the same journal entry
  $('div.journal div.thumbnails a').each(function() {
    var relgroup = 'thumbnails-' + $(this).closest('div.journal').attr('id');
    var title = $(this).attr('title');
    $(this)
      .attr('rel', relgroup)
      .attr('data-fancybox', relgroup)
      .attr('data-caption', title);
  });

  // add rel attribute to attachments of the same journal entry
  $('div.journal ul.details a.lightbox').each(function() {
    var relgroup = 'attachments-' + $(this).closest('div.journal').attr('id');
    var title = $(this).attr('title');
    $(this)
      .attr('rel', relgroup)
      .attr('data-fancybox', relgroup)
      .attr('data-caption', title);
  });

  // Support for contacts
  $('div.contact.details table.subject_header td.avatar a').each(function() {
    var href = $(this).attr('href');
    var filename = $(this).text();
    var title = $(this).attr('title');
    // only apply thumbnail class to image and pdf links
    if(href.match(extensionRegexAll)) {
      $(this)
        .attr('href', href.replace(/\/attachments\/(\d+)/g,'/attachments/download/$1' + filename))
        .addClass('lightbox')
        .attr('data-type', 'image')
        .attr('data-caption', title ? title : null);
    }
  });

  // Support for files module
  $('table.list.files td.filename a').each(function() {
    var href = $(this).attr('href');
    var filename = $(this).text();
    var title = $(this).attr('title');
    // Also support PDF preview in lightbox
    var isPdf = filename.match(/\.pdf$/i);
    // only apply thumbnail class to image and pdf links
    if(filename.match(extensionRegexAll)) {
      $(this)
        .attr('href', href.replace(/\/attachments\/(\d+)/g,'/attachments/download/$1/' + filename))
        .addClass(isPdf ? 'lightbox pdf' : 'lightbox')
        .attr('data-type', isPdf ? 'iframe' : 'image')
        .attr('data-caption', title ? filename + ' - ' + title : filename);
    }
  });

  // Support for issue list attachment column
  $('table.list.issues td.attachments a').each(function() {
    var filename = $(this).text();
    // group images to one issue
    if(filename.match(extensionRegexAll)) {
      if (!$(this).hasClass('icon-download')) {
        $(this).attr('data-fancybox', 'issue-list-attachments-' + $(this).closest('tr').attr('id'));
      }
    }
  });


  // DMSF support
  var dmsf_link_selector = 'a[data-downloadurl][href^="/dmsf/files/"][href$="/view"]';

  // #40 ... add class="thumbnail" to DMSF macro thumbnails on wiki pages
  $('div.wiki ' + dmsf_link_selector).each(function() {
    var filename = $(this).attr('data-downloadurl').split(':')[1];
    // Also support PDF preview in lightbox
    var isPdf = filename.match(/\.pdf$/i);
    // only apply thumbnail class to image and pdf links
    if(filename.match(extensionRegexAll)) {
      $(this)
        .addClass('thumbnail')
        .attr('data-type', isPdf ? 'iframe' : 'image')
        .attr('title', $(this).text())
        .attr('data-caption', filename)
        .removeAttr('target')
        .removeAttr('data-downloadurl');
    }
  });

  // #63 ... add class="lightbox" to DMSF image links in DMS browser
  $('.controller-dmsf #browser .dmsf_title ' + dmsf_link_selector).each(function() {
    var filename = $(this).attr('data-downloadurl').split(':')[1];
    // only apply thumbnail class to image and pdf links
    if(filename.match(extensionRegexImage)) {
      $(this)
        .addClass('lightbox')
        .attr('data-type', 'image')
        .attr('title', $(this).text())
        .attr('data-caption', filename)
        .attr('rel', 'dmsf-browser')
        .attr('data-fancybox', 'dmsf-browser')
        .removeAttr('target')
        .removeAttr('data-downloadurl');
    }
  });

  // DMSF support in issues: add class="lightbox" to DMSF thumbnails and preview links
  $('div.attachments.dmsf_parent_container a[href^="/dmsf/files/"][href$="/view"]').each(function() {
    // extract filename from attribute 'data-downloadurl' from closest element with the same 'href'
    var href = $(this).attr('href');
    var ddUrl = $(this).attr('data-downloadurl');
    var dmsfId = href.replace(/.*\/files\/(\d+)\/view/g, '$1');
    var filename = '';
    var title = '';

    // For some browsers, `attr` is undefined; for others, `attr` is false. Check for both.
    // https://css-tricks.com/snippets/jquery/make-an-jquery-hasattr/
    if (typeof ddUrl !== typeof undefined && ddUrl !== false) {
      // read local attribute if present (on DMSF textlinks)
      filename = ddUrl.split(':')[1];
      title = $(this).text();
    } else {
      // or read from corresponding DMSF textlink if no local data-downloadurl is present
      var correspondingElem = $('div.attachments.dmsf_parent_container > p > a[href="' + href + '"].dmsf-icon-file').first();
      filename = correspondingElem.attr('data-downloadurl').split(':')[1];
      title = correspondingElem.text();
    }

    // create 3 fancybox 'rel' groups to avoid image duplicates in slideshow
    var relgroup = '';
    if($(this).closest('div.thumbnails').length) {
      relgroup = 'thumbnails';
    } else if($(this).hasClass('icon-only')) {
      relgroup = 'icon';
    } else if($(this).hasClass('icon')) {
      relgroup = 'imagelink';
    }
    // Also support PDF preview in lightbox
    var isPdf = filename.match(/\.pdf$/i);
    // only apply thumbnail class to image and pdf links
    if(filename.match(extensionRegexAll)) {
      $(this)
        .addClass('lightbox')
        .attr('data-type', isPdf ? 'iframe' : 'image')
        .attr('title', '[' + dmsfId + '] ' + title)
        .attr('data-caption', '[' + dmsfId + '] ' + title)
        .attr('data-fancybox', 'dmsf-' + relgroup);
      // do not remove 'data-downloadurl' here otherwise the filename extraction crashes for following dmsf thumbnails
    }
  });

  // Add Fancybox to image links
  $('div.attachments a.lightbox')
    .add('div.attachments a.lightbox-preview')
    .add('table.list.files a.icon-magnifier:not([href$=".pdf"])')
    .add($('div.journal ul.details a:not(.icon-download)').filter(function(index,elem) { return $(elem).attr('href').match(extensionRegexImage); }) )
    .add('div.journal div.thumbnails a')
    .add('div.wiki a.thumbnail')
    .add('.controller-dmsf #browser a.lightbox')
    .add('.avatar a')
    .add('table.list.files td.filename a.lightbox')
    .fancybox({
      animationEffect    : 'zoom',
      animationDuration  : 200,
      transitionEffect   : 'fade',
      transitionDuration : 200,
      buttons: ['zoom', 'fullScreen', 'download', 'thumbs', 'close']
    });

  // Add Fancybox to PDF links
  $('div.attachments a.pdf')
    .add('table.list.files td.filename a.lightbox.pdf')
    .add('table.list.files a.icon-magnifier[href$=".pdf"]')
    .add( $('div.journal ul.details a:not(.icon-download)').filter(function(index,elem) { return $(elem).attr('href').match(/\.pdf$/i); }) )
    .add( $('div.journal div.thumbnails a').filter(function(index,elem) { return $(elem).attr('href').match(/\.pdf$/i); }) )
    .fancybox({
      animationEffect    : 'zoom',
      animationDuration  : 200,
      transitionEffect   : 'fade',
      transitionDuration : 200,
      type               : 'iframe',
      iframe : { preload: true },
      buttons: ['fullScreen', 'download', 'close' ]
    });
});
