# frozen_string_literal: true

loader = RedminePluginKit::Loader.new plugin_id: 'redmine_lightbox'

Redmine::Plugin.register :redmine_lightbox do
  name 'Redmine Lightbox'
  author 'AlphaNodes GmbH'
  description 'This plugin lets you preview image and pdf attachments in a lightbox.'
  version RedmineLightbox::VERSION
  url 'https://github.com/alphanodes/redmine_lightbox'
  author_url 'https://alphanodes.com'
  requires_redmine version_or_higher: '4.2'
end

RedminePluginKit::Loader.persisting { loader.load_model_hooks! }
RedminePluginKit::Loader.to_prepare { RedmineLightbox.setup! } if Rails.version < '6.0'
