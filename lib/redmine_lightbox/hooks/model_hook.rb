# frozen_string_literal: true

module RedmineLightbox
  module Hooks
    class ModelHook < Redmine::Hook::Listener
      def after_plugins_loaded(_context = {})
        return if Rails.version < '6.0'

        RedmineLightbox.setup!
      end
    end
  end
end
