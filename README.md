Redmine Lightbox
================

[![Run Rubocop](https://github.com/AlphaNodes/redmine_lightbox/workflows/Run%20Rubocop/badge.svg)](https://github.com/AlphaNodes/redmine_lightbox/actions/workflows/rubocop.yml) [![Run Brakeman](https://github.com/AlphaNodes/redmine_lightbox/workflows/Run%20Brakeman/badge.svg)](https://github.com/AlphaNodes/redmine_lightbox/actions/workflows/brakeman.yml) [![Run Tests](https://github.com/AlphaNodes/redmine_lightbox/workflows/Tests/badge.svg)](https://github.com/AlphaNodes/redmine_lightbox/actions/workflows/tests.yml)

This plugin lets you preview image (JPG, GIF, PNG, BMP) and PDF attachments in a lightbox based on [fancybox](https://fancyapps.com/fancybox/3/).

If you click on a thumbnail, lightbox view opens. You have to enable thumbnails in your Redmine settings. If you do not enable thumbnails, you cannot use lightbox view.

Requirements
------------

- Redmine 4.1 or higher
- Ruby 2.5 or higher

Installation and Setup
----------------------

- Clone this repo into your **redmine_root/plugins/** folder

  ```shell
  git clone https://github.com/alphanodes/redmine_lightbox.git
  ```

- Restart Redmine

Credits
-------

This is a fork of [redmine_lightbox2](https://github.com/paginagmbh/redmine_lightbox2), which was a fork of [redmine_lightbox](https://github.com/zipme/redmine_lightbox) plugin. Credits goes to @tofi86 and @zipme and all other distributors to these forks!

License
-------

*redmine_lightbox* plugin is developed under the [MIT License](LICENSE).
