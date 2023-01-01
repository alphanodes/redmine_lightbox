# frozen_string_literal: true

require_relative '../test_helper'

class UsersControllerTest < RedmineLightbox::ControllerTest
  fixtures :users, :groups_users, :email_addresses, :user_preferences,
           :roles, :members, :member_roles,
           :issues, :issue_statuses, :issue_relations,
           :issues, :issue_statuses, :issue_categories,
           :versions, :trackers, :enumerations,
           :projects, :projects_trackers, :enabled_modules,
           :attachments

  def test_fancybox_libs_loaded
    get :show,
        params: { id: 1 }

    assert_response :success
    assert_fancybox_libs
  end
end
