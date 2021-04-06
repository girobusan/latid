---
title: Themes
---
The themes support is in early stage of development, if at any stage at all (as of 06.04.2021). 

Theme files
-----------
Each theme would be distributed as archive (directory), which contains two subdirs:

1. `theme-name.t` (templates) , put it to your _config/themes directory
2. `theme-name.a` (assets), put it to your `src/themes/` directory

Setting up theme:
----------------
To set the theme, set  keys in the `settings.json`: `themes.enabled` to  `true` and  `themes.theme` property to theme name. That's it.

Notes on theme development
--------------------------
When developing your theme, remember that all assets, such as css files, images and scripts will be at `/themes/theme-name.a` directory
and set up your development environment accordingly. Read [templating doc](templates.md) about developing templates for your theme.
