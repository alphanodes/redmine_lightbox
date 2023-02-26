# frozen_string_literal: true

require File.expand_path '../../test_helper', __FILE__

class FilesControllerTest < RedmineLightbox::ControllerTest
  fixtures :projects, :trackers, :issue_statuses, :issues,
           :enumerations, :users,
           :email_addresses,
           :issue_categories,
           :projects_trackers,
           :roles, :member_roles, :members, :enabled_modules,
           :journals, :journal_details, :versions,
           :attachments

  def setup
    @request.session[:user_id] = 2
  end

  def test_index_fancybox_libs_loaded
    get :index, params: { project_id: 1 }

    assert_response :success
    assert_fancybox_libs
  end
end
