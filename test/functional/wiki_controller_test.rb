# frozen_string_literal: true

require File.expand_path '../../test_helper', __FILE__

class WikiControllerTest < RedmineLightbox::ControllerTest
  fixtures :projects, :users, :roles, :members, :member_roles,
           :trackers, :groups_users, :projects_trackers,
           :enabled_modules, :issue_statuses, :issues,
           :attachments,
           :enumerations, :custom_fields, :custom_values,
           :custom_fields_trackers,
           :wikis, :wiki_pages, :wiki_contents
  def setup
    @request.session[:user_id] = 2
  end

  def test_fancybox_libs_loaded
    get :show,
        params: { project_id: 1, id: 'Another_page' }

    assert_response :success
    assert_fancybox_libs
  end

  def test_lightbox_classes
    get :show,
        params: { project_id: 1, id: 'CookBook_documentation' }

    assert_response :success
    assert_select 'a.lightbox.pdf'
  end
end
