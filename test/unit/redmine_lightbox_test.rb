# frozen_string_literal: true

require File.expand_path '../../test_helper', __FILE__

class RedmineLightboxTest < RedmineLightbox::TestCase
  def build_controller(class_name, action_name)
    controller_class = Class.new do
      define_singleton_method(:to_s) { class_name }
    end

    controller = controller_class.new
    controller.define_singleton_method(:class) { controller_class }
    controller.define_singleton_method(:action_name) { action_name }
    controller
  end

  def test_lightbox_active_for_returns_false_for_nil_controller
    assert_not RedmineLightbox.lightbox_active_for?(nil)
  end

  def test_lightbox_active_for_returns_false_for_unsupported_controller
    controller = build_controller 'UnknownController', 'show'

    assert_not RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_true_for_issue_show
    controller = build_controller 'IssuesController', 'show'

    assert RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_true_for_issue_index
    controller = build_controller 'IssuesController', 'index'

    assert RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_false_for_issue_new
    controller = build_controller 'IssuesController', 'new'

    assert_not RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_false_for_issue_edit
    controller = build_controller 'IssuesController', 'edit'

    assert_not RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_true_for_wiki_show
    controller = build_controller 'WikiController', 'show'

    assert RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_false_for_wiki_edit
    controller = build_controller 'WikiController', 'edit'

    assert_not RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_true_for_files_index
    controller = build_controller 'FilesController', 'index'

    assert RedmineLightbox.lightbox_active_for?(controller)
  end

  def test_lightbox_active_for_returns_false_for_files_new
    controller = build_controller 'FilesController', 'new'

    assert_not RedmineLightbox.lightbox_active_for?(controller)
  end
end
