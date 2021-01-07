---
title: Command Line Interface
---

Latid can be invoked as command line utility. It's useful, when hosting on Jamstack. Just setup
your build action, using `l4cli.js` utility.
<!--cut-->

Execute this from the site directory:

    node l4cli.js

It will gather source files and generate output static htmls. Invoking with `-t` key initiates "time aware" generation (files with date in future won't be processed)
