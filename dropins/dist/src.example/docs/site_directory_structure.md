---
title: Site directory structure
---

The site files organized as follows:
<!--cut-->

    📁 site
        |
        📁 _config
        |     |
        |     setttings.json - main config file
        |     |
        |     📁 templates
        |           |
        |           index.njk - root template
        |           ...
        |           📁 blocks
        |                |
        📁 _system      [custom block templates]
        |    |
        |   [...system stuff...]
        |
        📁 src
        |    |
        |   [site source files]
        |
        📁 static
        |    |
        |   [output]
        |
        index.html
        latidserv.js - local server script
        l4cli.js - command line utility
