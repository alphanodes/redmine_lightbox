# frozen_string_literal: true

require_relative '../test_helper'

class WelcomeControllerTest < RedmineLightbox::ControllerTest
  fixtures :projects, :news, :users, :members, :roles, :member_roles, :enabled_modules,
           :attachments

  fixtures :dashboards, :dashboard_roles if Redmine::Plugin.installed? 'additionals'

  def setup
    @request.session[:user_id] = 2
  end

  def test_fancybox_libs_not_loaded
    get :index

    assert_response :success
    assert_not_fancybox_libs
  end
end
