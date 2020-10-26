---
title: Settings.json structure
date: 24.10.2020
---

The settings file is  [your site dir/]_config/settings.json. That's how it looks like, explanation follows.

    {
        "site": {
            "title": "My Awesomness",
            "motto": "Stupidity and bravery",
            "url": "https://example.com"
        },
        "output": {
            "dir": "static",
            "time_diff": 0,
            "debug": true,
            "content_selector": "#content",
            "list_max": 10
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


**output** 
------------------
    
    "output": {
        "dir": "static",
        "time_diff": 0,
        "debug": true,
        "content_selector": "#content",
        "list_max": 10
    }

### dir
Directory in site folder to output static files. Also hard coded, therefore optional, no need to bother with it.

### time_diff
Very optional — time difference in hours between creation dates, specified in the site files and the environment, in which generator script (l4cli.js) executed. Used when generation started with -t (time-aware) flag only. May come in handy when managing time-sensitive sites on Jamstack platforms. Does not affect GUI operation in any way.

### content_selector
Required. CSS selector of the main content container. Used in GUI mode.

### list_max
Required. Maximum number of items per page in multipage article lists.

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