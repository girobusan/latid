---
title: Files and views
---

*View* is an internal representation of site page. It is an object with the following fields:

uri
---
Page uri, which is an __absolute__ reference of page on site, like /index.html , /tags/tag.html. Therefore, it's always starts with "/".

path
----
Path to source file __relative__ to [site directory]/src, like index.json , tags/tag.json. If the file is rendered as more than one page, all of that pages will share common *path* (because it refers to one source file), but have different *uris*. 

As a relative path, it's newer starts with "/".

type
----
May be "copy" for files which are copied from source to output, "src" for source files, which are somehow processed and|or edited.

nolist
------
View does not displayed in any lists.

file
----
Source file, as an object. For example, file metadata is accessible via *view*.file.meta, file content — file.content.

virtual
-------
Defined and true in vurtual Views (generated pages, tags)

pager_uris
----------
List of uris of pages, if file splited to multiple pages (=views).

current_page
------------
If file is split to multiple pages, number of page which this particular view represents.
