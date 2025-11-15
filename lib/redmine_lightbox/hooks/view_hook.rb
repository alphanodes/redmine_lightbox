# frozen_string_literal: true

module RedmineLightbox
  module Hooks
    class ViewHook < Redmine::Hook::ViewListener
      def view_layouts_base_html_head(context = {})
        return unless RedmineLightbox.lightbox_controllers.include? context[:controller].class.to_s

        stylesheet_link_tag('glightbox.min.css', plugin: 'redmine_lightbox', media: 'screen') +
          stylesheet_link_tag('lightbox.css', plugin: 'redmine_lightbox', media: 'screen') +
          javascript_include_tag('glightbox.min.js', plugin: 'redmine_lightbox') +
          javascript_include_tag('lightbox.js', plugin: 'redmine_lightbox')
      end
    end
  end
end
