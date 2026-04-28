# frozen_string_literal: true

module RedmineLightbox
  VERSION = '2.0.0'
  GLIGHTBOX_VERSION = '3.3.1'

  include RedminePluginKit::PluginBase

  class << self
    # list of all controllers for lightbox support
    def lightbox_controllers
      @lightbox_controllers ||= lightbox_targets.keys
    end

    # Map of controller class name => allowed actions (Array)
    # or nil meaning "all actions allowed".
    def lightbox_targets
      @lightbox_targets ||= lightbox_fixed_targets.merge lightbox_plugins_targets
    end

    # Returns true if the lightbox should be active for the given controller instance.
    def lightbox_active_for?(controller)
      return false unless controller

      allowed_actions = lightbox_targets[controller.class.to_s]
      return false if allowed_actions.nil? && !lightbox_targets.key?(controller.class.to_s)

      allowed_actions.nil? || allowed_actions.include?(controller.action_name)
    end

    private

    def setup
      # load helper for supported controllers
      lightbox_controllers.each do |lightbox_controller|
        lightbox_controller.constantize.send :helper, LightboxHelper
      end

      # Load view hooks
      loader.load_view_hooks!
    end

    def lightbox_fixed_targets
      {
        'IssuesController' => %w[show index],
        'WikiController' => %w[show],
        'DocumentsController' => %w[show index],
        'FilesController' => %w[index],
        'MessagesController' => %w[show],
        'NewsController' => %w[show index],
        'UsersController' => %w[show]
      }.freeze
    end

    # these controllers have to be checked, if plugins are installed.
    # value nil means "all actions allowed" (we cannot reliably know
    # third-party plugin actions, so we stay permissive).
    def lightbox_plugins_targets
      targets = {}
      if Redmine::Plugin.installed?('redmine_contacts') || Redmine::Plugin.installed?('redmine_servicedesk')
        targets['ContactsController'] = nil
      end
      targets['ArticlesController'] = nil if Redmine::Plugin.installed? 'redmine_knowledgebase'
      targets['DbEntriesController'] = nil if Redmine::Plugin.installed? 'redmine_db'
      targets['DmsfController'] = nil if Redmine::Plugin.installed? 'redmine_dmsf'

      if Redmine::Plugin.installed?('redmine_contacts_invoices') || Redmine::Plugin.installed?('redmine_servicedesk')
        targets['InvoicesController'] = nil
      end

      targets['PasswordsController'] = nil if Redmine::Plugin.installed? 'redmine_passwords'
      targets['ReportingFilesController'] = nil if Redmine::Plugin.installed? 'redmine_reporting'

      targets
    end
  end
end
