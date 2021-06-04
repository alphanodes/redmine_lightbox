# frozen_string_literal: true

require File.expand_path '../../test_helper', __FILE__

class NewsControllerTest < RedmineLightbox::ControllerTest
  fixtures :projects, :users, :email_addresses, :roles, :members, :member_roles,
           :enabled_modules, :news, :comments,
           :attachments, :user_preferences

  def setup
    @request.session[:user_id] = 2
  end

  def test_show_fancybox_libs_loaded
    get :show, params: { id: 1 }

    assert_response :success
    assert_fancybox_libs
  end
end
