# frozen_string_literal: true

module LightboxHelper
  def link_to_attachment(attachment, **options)
    with_lightbox = false

    if options[:class].present? && options[:class].include?('icon-download')
      # we don't want lightbox for this link, because this case duplicated entries in image slide
    elsif attachment.is_pdf? || attachment.is_image?
      with_lightbox = true
      options[:class] = lightbox_image_classes attachment, options[:class]
    end

    if with_lightbox
      options[:download] = true
      caption = lightbox_image_caption attachment

      options[:title] ||= "#{l :label_preview}: #{caption}"
      options[:rel] ||= 'attachments'
      options[:data] = { type: attachment.is_pdf? ? 'iframe' : 'image',
                         fancybox: options[:rel],
                         caption: caption }
    end

    super
  end

  def thumbnail_tag(attachment)
    thumbnail_size = Setting.thumbnails_size.to_i
    caption = lightbox_image_caption attachment

    options = { title: "#{l :label_preview}: #{caption}",
                rel: 'thumbnails',
                class: lightbox_image_classes(attachment) }

    options[:data] = { type: attachment.is_pdf? ? 'iframe' : 'image',
                       fancybox: options[:rel],
                       caption: caption }

    link_to image_tag(thumbnail_path(attachment),
                      srcset: "#{thumbnail_path attachment, size: thumbnail_size * 2} 2x",
                      style: "max-width: #{thumbnail_size}px; max-height: #{thumbnail_size}px;"),
            download_named_attachment_path(attachment, filename: attachment.filename),
            options
  end

  def lightbox_image_caption(attachment)
    caption = attachment.filename.dup
    caption << " - #{attachment.description}" if attachment.description.present?

    caption
  end

  def lightbox_image_classes(attachment, base_classes = '')
    classes = []
    classes << base_classes.split if base_classes.present?

    if attachment.is_pdf?
      classes << 'lightbox'
      classes << 'pdf'
    elsif attachment.is_image?
      classes << 'lightbox'
      classes << attachment.filename.split('.').last.downcase
    end

    classes.join ' '
  end
end
