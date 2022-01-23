---
title: Command Line Interface
ru: "../ru/cli.md"
---

Latid can be invoked as command line utility. It's useful, when hosting on Jamstack. Just setup
your build action, using `l4cli.js` utility.
<!--cut-->

Execute this from the site directory:

    node l4cli.js

It will gather source files and generate output static htmls. 

## Paremeters

| parameter | meaning |
|-----------|---------|
| -t        | Skip files with dates in future. |
| -c        | Execute publish command from [settings.toml](settings_toml.md) after generation. |

