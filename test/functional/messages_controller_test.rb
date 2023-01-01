# frozen_string_literal: true

require_relative '../test_helper'

class MessagesControllerTest < RedmineLightbox::ControllerTest
  fixtures :projects, :users, :email_addresses, :user_preferences, :members,
           :member_roles, :roles, :boards, :messages,
           :enabled_modules, :watchers,
           :attachments

  def setup
    @request.session[:user_id] = 2
  end

  def test_show_fancybox_libs_loaded
    get :show, params: { board_id: 1, id: 1 }

    assert_response :success
    assert_fancybox_libs
  end
end
