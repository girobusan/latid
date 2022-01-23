---
title: Command Line Interface
ru: "../ru/cli.md"
---

Latid can be invoked as command line utility. It's useful, when hosting on 
Jamstack. Just setup your build action, using `l4cli.js` utility.
<!--cut-->

Execute this from the site directory:

    node l4cli.js

It will gather source files and generate output static htmls. 

### Command line parameters

| parameter | meaning                                                        |
|-----------|----------------------------------------------------------------|
| -t  | **T**ime-aware generation, e. g. skip files with dates in future.    |
| -c  | Execute publish **C**ommand from [settings.toml](settings_toml.md) after generation. |
| -p  | **P**ublish only. Do not generate html, just execute publish command |

Commands can be combined (except the last one).
