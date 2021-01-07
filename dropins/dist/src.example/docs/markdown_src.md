---
title: Markdown source files
---

You can use markdown formatted source files on your site alongside with others. It's possible to edit those files in GUI, including metadata. But you can not create markdown source files from GUI (yet).
<!--cut-->

Requirements
-----------
Markdown file will be recognized as source if it has frontmatter header with, at least, `title` field
defined, like this, unless the option `markdown.force_source` in settings file is set to `true`:

    ---
    title: Writting in Markdown
    ---

    This is Markdown
    -----------------
    And it rocks

If there is no frontmatter or no title field in frontmatter, the file will be simply copied to output.

If `force_source` is set, Latid will use all markdown files as source, and figure out metadata by using
some not-so-sophisticated heuristics.

All metadata fields are respected and editable in GUI metaeditor. Feel free to use it like this:

    ---
    title: Blog post
    tags: interesting, why this, md
    date: 2020.10.25 16:30
    id: 23789
    custom: field
    ---

Links in markdown
-----------------
Links in markdown text is rewritten by [regular rulers](links.md) (absolute links rewritten to relative, 
 "plus links" expanded, others are not touched). If you have a bunch interlinked markdown files, which use relative
links between them, you'd better to set`markdown.fix_links` in settings to `true`. Thus the extensions
`.md` and `.markdown` in links will be replaced with `.html`, and, therefore, point to html files
generated from  markdown. This option is set to `true` by default.


Markdown flavor
---------------
Latid uses `markdown-it` library, with inline html enabled, and `markdown-it-multimd-table` plugin for extended table syntax. Together it works much like Github flavored markdown (GFM).
