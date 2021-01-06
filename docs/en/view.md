---
title: Files and views
---

*View* is an internal representation of site page. It is an object with fields, containing
various file information.
<!--cut-->

uri
---
Page uri, which is an __absolute__ reference of page on site, like `/index.html` , `/tags/tag.html`. Therefore, it's always starts with "/".

path
----
Path to source file __relative__ to [site directory]/src, like `index.json` , `tags/tag.json`. If the file is rendered as more than one page, all of that pages will share common *path* (because it refers to one source file), but have different *uris*. 

As a relative path, it's newer starts with "/".

type
----
May be "copy" for files which are copied from source to output, "src" for source files, which are somehow processed and|or edited.

nolist
------
View does not displayed in any lists.

file
----
Source file, as an object. For example, file metadata is accessible via `[view].file.meta`, file content — `[view].file.content`.

virtual
-------
Defined and true in virtual Views (generated pages, tags)

pager_uris
----------
List of uris of pages, if the source file was split to multiple pages, and this View represents one of them.

current_page
------------
If the view represents one of multiple pages, number of page which this particular view represents.

tagged_list
-----------
If view is a tag page, list of views tagged with this tag.

pages_list
----------
List of views, which are listed on this page, for example, if the page is a section title page (index).

tagslist
--------
List of tags, attached to this View, with each tag represented as View of tag page. Will be renamed to `tags_list` in future releases, for consistency.
