---
title: Template variables
section: "03.02"
---
There are bunch of variables, which can be accessed from your nunjucks templates.
<!--cut-->

content
-------
Page content

editmode
--------
Boolean, true if page is being previewed.

embed
-----
Function, returns any view (page) content by uri.

    <h2>Docs menu</h2>
    {{embed("/docs/menu.html")}}

list
----
List operations (listops module)

log
----
Log function (obsolete)

meta
----
Site metadata. For now, there is only tags list at meta.tags

paths
-----
Path operations utilities

settings
--------
Site settings from settings.json

util
----
Utilities, see [util](util.md) module.

view
----
View of current page

views
-----
List of all [views](views.md) (pages and files)

