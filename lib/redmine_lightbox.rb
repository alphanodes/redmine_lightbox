# frozen_string_literal: true

require 'redmine_lightbox/version'

module RedmineLightbox
  FANCYBOX_VERSION = '3.5.7'

  class << self
    def setup
      # load helper for supported controllers
      lightbox_controllers.each do |lightbox_controller|
        lightbox_controller.constantize.send :helper, LightboxHelper
      end

      # Hooks
      require_dependency 'redmine_lightbox/hooks'
    end

    # list of all controllers for lightbox support
    def lightbox_controllers
      @lightbox_controllers ||= lightbox_fixed_controllers + lightbox_plugins_controllers
    end

    private

    def lightbox_fixed_controllers
      %w[IssuesController
         WikiController
         DocumentsController
         FilesController
         MessagesController
         NewsController
         UsersController].freeze
    end

    # this controllers have to be checked,
    # if plugins are installed
    def lightbox_plugins_controllers
      controllers = []
      if Redmine::Plugin.installed?('redmine_contacts') || Redmine::Plugin.installed?('redmine_servicedesk')
        controllers << 'ContactsController'
      end
      controllers << 'ArticlesController' if Redmine::Plugin.installed? 'redmine_knowledgebase'
      controllers << 'DbEntriesController' if Redmine::Plugin.installed? 'redmine_db'
      controllers << 'DmsfController' if Redmine::Plugin.installed? 'redmine_dmsf'

      if Redmine::Plugin.installed?('redmine_contacts_invoices') || Redmine::Plugin.installed?('redmine_servicedesk')
        controllers << 'InvoicesController'
      end

      controllers << 'PasswordsController' if Redmine::Plugin.installed? 'redmine_passwords'
      controllers << 'ReportingFilesController' if Redmine::Plugin.installed? 'redmine_reporting'

      controllers
    end
  end
end
