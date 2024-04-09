# frozen_string_literal: true

if ENV['COVERAGE']
  require 'simplecov'
  SimpleCov.start :rails do
    add_filter 'init.rb'
    root File.expand_path "#{File.dirname __FILE__}/.."
  end
end

require File.expand_path "#{File.dirname __FILE__}/../../../test/test_helper"

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
    def assert_fancybox_libs
      assert_select "link:match('href',?)", %r{/jquery.fancybox}, count: 1
      assert_select "script:match('src',?)", %r{/jquery.fancybox.*\.js}, count: 1
    end

    def assert_not_fancybox_libs
      assert_select "link:match('href',?)", %r{/jquery.fancybox}, count: 0
      assert_select "script:match('src',?)", %r{/jquery.fancybox.*\.js}, count: 0
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
