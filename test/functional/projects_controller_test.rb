# frozen_string_literal: true

require File.expand_path '../../test_helper', __FILE__

class ProjectsControllerTest < RedmineLightbox::ControllerTest
  fixtures :projects, :users,
           :roles, :members, :member_roles,
           :issues, :issue_statuses, :versions,
           :trackers, :projects_trackers,
           :issue_categories, :enabled_modules,
           :attachments

  fixtures :dashboards, :dashboard_roles if Redmine::Plugin.installed? 'additionals'

  def setup
    @request.session[:user_id] = 2
  end

  def test_index_fancybox_libs_not_loaded
    get :index

    assert_response :success
    assert_not_fancybox_libs
  end

  def test_show_fancybox_libs_not_loaded
    get :show,
        params: { id: 1 }

    assert_response :success
    assert_not_fancybox_libs
  end
end
