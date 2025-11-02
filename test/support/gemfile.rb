# frozen_string_literal: true

source 'https://rubygems.org'

group :test do
  gem 'brakeman', require: false
  gem 'rubocop', require: false
  gem 'rubocop-minitest', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
end
