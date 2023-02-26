# frozen_string_literal: true

require File.expand_path '../../test_helper', __FILE__

class DocumentsControllerTest < RedmineLightbox::ControllerTest
  fixtures :projects, :users, :email_addresses, :roles, :members, :member_roles,
           :enabled_modules, :documents, :enumerations,
           :groups_users, :user_preferences,
           :attachments

  def setup
    @request.session[:user_id] = 2
  end

  def test_show_fancybox_libs_loaded
    get :show,
        params: { id: 1 }

    assert_response :success
    assert_fancybox_libs
  end

  def test_lightbox_classes
    get :show,
        params: { id: 1 }

    assert_response :success
    assert_select 'a.lightbox.jpg'
  end
end
