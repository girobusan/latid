---
title: Templates
---
A lots of Latid site functionality is based upon it's templating mechanics. 
Latid uses [nunjucks templates](https://mozilla.github.io/nunjucks/). There is mandatory file, `index.njk`, from where you may set up all the routing and other logic using nunjucks abilities to conditionally extend, include and so on. 
<!--cut-->

Site templates can utilize all features of nunjuck template language, you may have any number of files. 
Note, that only index.njk is loaded directly, other templates have to be extended, included or otherwise accessed through it.

Site templates located in `[site directory]/_config/templates`, if no theme is used.
See  [themes](themes.md) for additional info.

Additional filters
------------------
There are additional filters, available in Latid. For now:

### nbsp

Adds non-breakable space after short words. Use with caution, 
it's not always play well with html tags.

### msort  
Returns copy of views list, sorted by specified meta value. Example: 

    {% set sorted = array | msort(reverse, field_name , as_number) %}

parameters are:
- `reverse`: reverse order, boolean
- `field_name`: name of the metadata field to sort by
- `as_number`: if true, treat field value as number, if false (default) - string.

### metasort
Same, but with more sane parameters order:
1. `field_name`
1. `reverse`
1. `as_number`


Blocks templates
----------------
Custom block templates are located in `[site directory]/_config/templates/blocks`. By using those templates, you can customize an html rendering of article blocks.

__It's better to stick with default html for blocks in any case. Customizing of block html must be considered the last option.__

Please note, that in edit mode the blocks will be displayed using default html rendering, regardless of custom templates, so you'll have to have some reasonable css for this case anyway.

### Block templates naming
Block templates must be kept in separate files, named by the respective block names with addition of extension `.njk`. For example, 
custom templates for divider must be named `divider.njk`.

### Template features in block templates
If you want to use include, use or other template functions, which require to 
load other templates, use prefix `block/`, like `block/inclusion_tpl_name.njk`. It's
better to avoid inclusions and imports for now, this mechanics is at testing stage
(v1.9.x), and may be changed in future. 

