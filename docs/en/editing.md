---
title: Editing, saving and generating site
---
Editing files in GUI is pretty easy, and almost self-explanatory. 
<!--cut-->

Editing existing page
---------------------
When you're in GUI, you can browse to page, than click *view/edit* button, and page will go to edit mode. For markdown source files you'll see simple text editor, for files, created in block editor the interface will be a bit fancier.

Saving pages
------------
After editing, just click *save current* button. 

Creating new page or directory
-------------------------------
First, browse to directory, where new page will be created. For example, if site has a blog section, and you want to add a new blog article, you (usually) have to browse to the title page of the blog, or to any regular page inside that section.

Than click *+page* or *+dir* (former will add subsection to current section), and you'll be presented with new blank page. Now you can add|edit metadata for new page, and fill it with some content.

Block editor basics
-------------------
Pages, created with GUI, are composed of content blocks. To add the first block to the empty page, go to edit mode and move cursor over *edit mode* badge on top of the page. The plus sign will appear on the left, click it and you'll see the blocks menu. Choose your first block there and click it's icon. Block will be added.

To add more blocks, hover your mouse over any existent block, and the plus button will appear on it's left. Than you can add new block after.

Refer to `blockeditor.md` for detailed instructions.

Generating static files
-----------------------
After you finish your edits, you can generate final, static version of the site. From GUI this function engaged by clicking *generate site* button. 

You can also use the [command line utility](cli.md). Open your terminal, change current directory to your site directory and run following command:

    node l4cli.js

The result of both actions will be the same. The latter is useful, when you deploying to Jamstack server.
