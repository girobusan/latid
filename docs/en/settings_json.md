---
title: Settings.json structure
date: 24.10.2020
section: "01.03"
---

The settings file is  [your site dir/]_config/settings.json. That's how it looks like, explanation follows.
<!--cut-->

    {
        "site": {
            "title": "My Awesomness",
            "motto": "Stupidity and bravery",
            "url": "https://example.com"
        },
        "editor" : {
        "content_selector": "#content",
        "local_server_port" : 1234,
        "default_meta"  :{
            "tags" : "",
            "lang" : "all"
            }
        },
        "output": {
          "dir": "static",
          "time_diff": 0,
          "debug": true,
          "content_selector": "#content",
          "list_max": 10,
          "default_date"  : "01.01.1970 12:30",
          "date_aware_generation" : false
        },
        "themes" :{
          "enabled" : false,
          "theme" : "theme_name"
        },

        "markdown":{
          "fix_links" : true ,
          "force_source" : false
        },


        "tags": {
          "dir": "/tags/"
        },
        "rss": {
            "uri": "/rss.xml",
            "count": 20
        },
        "publish":{
            "command" : "",
            "args" : ""
        },
        "custom":{
          "name" : "value"
        }
    }

**site**
----------------

    "site": {
        "title": "My Awesomness",
        "motto": "Stupidity and bravery",
        "url": "https://example.com"
    }

The title, motto and url of your site. The url is required. Do not accidentally leave the "/" at the end of url like this: 'http://example.com/'


**editor**
-----------

        "editor" : {
        "content_selector": "#content",
        "local_server_port" : 1234,
        "default_meta"  :{
            "tags" : "",
            "lang" : "all"
            }

### content_selector
Required. CSS selector of the main content container. Used in GUI mode. Formerly was defined in *output* section.

### local_server_port
Optional. Port, on which local server will listen.

### default_meta
Optional. Default metadata, which will be added to newly created files.


**output** 
------------------
    
    "output": {
        "dir": "static",
        "time_diff": 0,
        "debug": true,
        "content_selector": "#content",
        "list_max": 10,
        "default_date"  : "01.01.1970 12:30"
    }

### debug
Debug messages on|off.

### dir
Directory in site folder to output static files. Also hard coded, therefore optional, no need to bother with it.

### time_diff
Very optional — time difference in hours between creation dates, specified in the site files and the environment, in which generator script (l4cli.js) executed. Used when generation started with -t (time-aware) flag only. May come in handy when managing time-sensitive sites on Jamstack platforms. Does not affect GUI operation in any way.

### content_selector
Required. CSS selector of the main content container. Used in GUI mode. Will be moved to *editor* section in future releases.

### list_max
Required. Maximum number of items per page in multipage article lists.

### default_date
Optional. Default date for files without date. If not defined, file modification date
will be used instead.

### date_aware_generation
Optional. Boolean: is date aware generation on or off. Date awareness means?
that files with date in future will be excluded from generation. You should
not set this setting directly (for now, as of v1.10.1). 

## themes
     "themes" :{
       "enabled" : false,
       "theme" : "dummy"
     },

[Themes](themes.md) settings

### enabled
Required. Is themes enabled or not.
### theme
Optional. Name of the theme.

## markdown


        "markdown":{
          "fix_links" : true ,
          "force_source" : false
        }
### fix_links
Fix links to markdown files, change extension from 
`md|markdown` to `html`.

### force_source
If true, every markdown file, even without frontmatter, 
will be processed as source file.

**tags**
----

        "tags": {
            "dir": "/tags/"
        },

### dir
Required. Directory for tag pages.

**rss**
---
        "rss": {
            "uri": "/rss.xml",
            "count": 20
        }

### uri
Required. URI of generated RSS file

### count
Optional. Max number of items in RSS feed.

**publish**
-------
Optional. For now (2020.10.24), this settings are used in Latid-browser only. 

        "publish":{
            "command" : "",
            "args" : ""
        }

### command
Command to run in order to publish the site.

### args
Aforementioned command arguments, string or array. The working directory of the command will be set to the site directory.
