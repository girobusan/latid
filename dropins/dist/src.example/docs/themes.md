---
title: Themes
---
The themes support is at early stage of development. 

Theme files
-----------
Each theme would be distributed as archive (directory), which contains two subdirs:

1. `templates` (templates) , put it to your _config/themes/<theme-name> directory
2. `assets` (assets), put it to your `src/themes/<theme-name>` directory

Setting up theme:
----------------
To set the theme, set  keys in the `settings.toml`: 
`themes.enabled` to  `true` and  `themes.theme` property to theme name. That's it.

    "themes" :{
      "enabled" : true,
      "theme" : "your-theme-name-here"
    },

Notes on theme development
--------------------------
Theme can include custom *block templates,* they
live in `_config/themes/<theme-name>/templates/blocks`

When developing your theme, remember that all assets, such as css files, 
images and scripts will be at `/themes/<theme-name>/assets` directory
and set up your development environment accordingly. 
Read [templating doc](templates.md) about developing templates for your theme.

