---
title: Settings.json structure
date: 24.10.2020
excerpt: <p>The settings file is  [your site dir/]_config/settings.json. That's how it looks like, explanation follows.</p>
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
          "list_max": 10
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
        "default_meta"  :{
            "tags" : "",
            "lang" : "all"
            }

### content_selector
Required. CSS selector of the main content container. Used in GUI mode. Formerly was defined in *output* section.

### default_meta
Optional. Default metadata, which will be added to newly created files.


**output** 
------------------
    
    "output": {
        "dir": "static",
        "time_diff": 0,
        "debug": true,
        "content_selector": "#content",
        "list_max": 10
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