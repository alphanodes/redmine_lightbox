# frozen_string_literal: true

if ENV['COVERAGE']
  require 'simplecov'
  SimpleCov.start :rails do
    add_filter 'init.rb'
    root File.expand_path "#{File.dirname __FILE__}/.."
  end
end

require_relative '../../../test/test_helper'

module RedmineLightbox
  module PluginFixturesLoader
    def fixtures(*table_names)
      dir = "#{File.dirname __FILE__}/fixtures/"
      table_names.each do |x|
        ActiveRecord::FixtureSet.create_fixtures dir, x if File.exist? "#{dir}/#{x}.yml"
      end
      super table_names
    end
  end

  class ControllerTest < Redmine::ControllerTest
    FANCYBOX_JS = "/plugin_assets/redmine_lightbox/javascripts/jquery.fancybox-#{RedmineLightbox::FANCYBOX_VERSION}.min.js"
    FANCYBOX_CSS = "/plugin_assets/redmine_lightbox/stylesheets/jquery.fancybox-#{RedmineLightbox::FANCYBOX_VERSION}.min.css"

    def assert_fancybox_libs
      assert_select 'link[rel=stylesheet][href^=?]', FANCYBOX_CSS, count: 1
      assert_select 'script[src^=?]', FANCYBOX_JS, count: 1
    end

    def assert_not_fancybox_libs
      assert_select 'link[rel=stylesheet][href^=?]', FANCYBOX_CSS, count: 0
      assert_select 'script[src^=?]', FANCYBOX_JS, count: 0
    end

    extend PluginFixturesLoader
  end

  class TestCase < ActiveSupport::TestCase
    extend PluginFixturesLoader
  end

  class IntegrationTest < Redmine::IntegrationTest
    extend PluginFixturesLoader
  end
end
