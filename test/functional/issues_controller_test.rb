# frozen_string_literal: true

require_relative '../test_helper'

class IssuesControllerTest < RedmineLightbox::ControllerTest
  fixtures :users, :email_addresses, :roles,
           :enumerations,
           :projects, :projects_trackers, :enabled_modules,
           :members, :member_roles,
           :issues, :issue_statuses, :issue_categories, :issue_relations,
           :versions, :trackers, :workflows,
           :custom_fields, :custom_values, :custom_fields_projects, :custom_fields_trackers,
           :time_entries,
           :watchers, :journals, :journal_details,
           :repositories, :changesets, :queries,
           :attachments

  def setup
    @request.session[:user_id] = 2
  end

  def test_fancybox_libs_loaded
    get :show, params: { id: 2 }

    assert_fancybox_libs
  end

  def test_lightbox_classes
    get :show,
        params: { id: 2 }

    assert_response :success
    assert_select 'a.lightbox.jpg'
  end

  def test_lightbox_classes_with_multiple_files_in_issue
    get :show,
        params: { id: 14 }

    assert_response :success
    assert_select 'a.icon-attachment.lightbox.png', count: 4
  end
end
