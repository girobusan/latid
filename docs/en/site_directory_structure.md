---
title: Site directory structure
section: "01.04"
---

The site files organized as follows:
<!--cut-->

    📁 site
        |
        |________________📁 _config__
        |                            |
        |                            setttings.toml - main config file
        |                            |
        |                            📁 scripts - custom scripts 
        |                            |
        |                            📁 themes - theme files
        📁 _system                   |
        |    |                       📁 templates
        |  system                          |
        |  stuff                           index.njk - root template
        |                                   ...
        |                                  📁 blocks
        📁 src                             |
        |   |                         custom block templates
        | site so       
        | files     
        |
        📁 static
        |    |
        | output
        |
        index.html
        latidserv.js - local server script
        l4cli.js - command line utility
