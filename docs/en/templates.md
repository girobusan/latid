---
title: Templates
---

Site templates
--------------
Site templates located in [site directopry]/_config/templates.

Latid uses [nunjucks templates](https://mozilla.github.io/nunjucks/). There is mandatory file, index.njk, from where you may set up all the routing and other logic using nunjucks abilities to conditionaly extend, include and so on. 

Site templates can utilize all fetures of nunjuck template language, you may have any number of files. Note, that only index.njk is loaded directly, other templates has to be extended, included or otherwise accessed through it.

Blocks templates
----------------
Custom block templates are located in [site directory]/_config/templates/blocks. By using those templates, you can customize an html rendering of article blocks.

__It's better to stick with default html for blocks in any case. Customising of block html must be considered the last option.__

Please note, that in edit mode the blocks will be displayed using default html rendering, regardless of custom templates, so you'll have to have some resonable css for this case anyway.

### Block templates naming
Block templates must be kept in separate files, named by the respective block names with addition of extension .njk. For example, custom templates for divider must be named divider.njk.

### Template features in block templates
You can not use extend, include or any other nunjucks method, which requires loading of external templates in block templates, contrary to the site templates.



