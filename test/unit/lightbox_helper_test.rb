# frozen_string_literal: true

require File.expand_path '../../test_helper', __FILE__

class LightboxHelperTest < RedmineLightbox::TestCase
  include LightboxHelper

  def test_lightbox_image_classes_for_avif
    attachment = Attachment.new filename: 'photo.avif'

    assert_equal 'lightbox avif', lightbox_image_classes(attachment)
  end

  def test_lightbox_image_classes_for_svg
    attachment = Attachment.new filename: 'diagram.svg'

    assert_equal 'lightbox svg', lightbox_image_classes(attachment)
  end

  def test_lightbox_attachment_type_for_avif_is_image
    attachment = Attachment.new filename: 'photo.avif'

    assert_equal 'image', lightbox_attachment_type(attachment)
  end

  def test_lightbox_attachment_type_for_svg_is_image
    attachment = Attachment.new filename: 'diagram.svg'

    assert_equal 'image', lightbox_attachment_type(attachment)
  end
end
