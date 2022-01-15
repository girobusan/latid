---
title: Site directory structure
section: "01.04"
---

The site files organized as follows:
<!--cut-->

    📁 site
        |
        📁 _config
        |     |
        |     setttings.toml - main config file
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
