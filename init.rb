# frozen_string_literal: true

Redmine::Plugin.register :redmine_lightbox do
  name 'Redmine Lightbox'
  author 'AlphaNodes GmbH'
  description 'This plugin lets you preview image and pdf attachments in a lightbox.'
  version RedmineLightbox::VERSION
  url 'https://github.com/alphanodes/redmine_lightbox'
  author_url 'https://alphanodes.com'
  requires_redmine version_or_higher: '4.1'
end

Rails.configuration.to_prepare do
  RedmineLightbox.setup
end
