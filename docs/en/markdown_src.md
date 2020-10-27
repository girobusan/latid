---
title: Markdown source files
---

You can use markdown formatted source files on your site alongside with others. It's possible to edit those files in GUI, including metadata. But you can not create markdown source files from GUI (yet).

Requirements
-----------
Markdown file will be recognized as source if it has frontmatter header with, at least, `title` field defined, like this:

    ---
    title: Writting in Markdown
    ---

    This is Markdown
    -----------------
    And it rocks

If there is no frontmatter or no title field in frontmatter, the file will be simply copied to output. 

All metadata fields are respected and editable in GUI metaeditor. Feel free to use it like this:

    ---
    title: Blog post
    tags: interesting, why this, md
    date: 2020.10.25 16:30
    id: 23789
    custom: field
    ---

Markdown flavor
---------------
Latid uses `markdown-it` library, with inline html enabled, and `markdown-it-multimd-table` plugin for extended table syntax. Together it works much like Github flavored markdown (GFM).