Redmine Lightbox
================

[![Run Linters](https://github.com/AlphaNodes/redmine_lightbox/workflows/Run%20Linters/badge.svg)](https://github.com/AlphaNodes/redmine_lightbox/actions/workflows/linters.yml) [![Run Tests](https://github.com/AlphaNodes/redmine_lightbox/workflows/Tests/badge.svg)](https://github.com/AlphaNodes/redmine_lightbox/actions/workflows/tests.yml)

This plugin lets you preview image (JPG, GIF, PNG, BMP) and PDF attachments in a lightbox based on [GLightbox](https://github.com/biati-digital/glightbox).

Requirements
------------

- Redmine 6.1 or higher
- Ruby 3.2 or higher

Installation and Setup
----------------------

For Redmine 6.1 or higher
-------------------------

- Clone this repo into your **redmine_root/plugins/** folder

  ```shell
  cd redmine
  git clone https://github.com/alphanodes/redmine_lightbox.git plugins/redmine_lightbox
  bundle config set --local without 'development test'
  bundle install
  ```

- Restart Redmine

For Redmine versions before 6.1
--------------------------------

If you are using Redmine 5.0 - 6.0, install the stable branch which uses Fancybox 3.5.7:

```shell
cd redmine
git clone -b stable https://github.com/alphanodes/redmine_lightbox.git plugins/redmine_lightbox
bundle config set --local without 'development test'
bundle install
```

- Restart Redmine

Contribution and usage
----------------------

If you use our fork and have some improvements for it, please create a PR (we can discuss your changes in it).

Credits
-------

This is a fork of [redmine_lightbox2](https://github.com/paginagmbh/redmine_lightbox2), which was a fork of [redmine_lightbox](https://github.com/zipme/redmine_lightbox) plugin. Credits goes to @tofi86 and @zipme and all other distributors to these forks!

License
-------

*redmine_lightbox* plugin is developed under the [MIT License](LICENSE).
