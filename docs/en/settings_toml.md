---
title: Settings file
---

Latid cofiguration is kept in the file `_config/settings.toml` in TOML
format. This is a commented Latid config file. 

    [site]
    
    # Required. Site title.
    
        title = "Example Latid Site"
        
    # Site motto. Optional.
    
        motto = "Proud To Be Default"
    
    # Site url. Required!
    
        url = "https://example.com"

    [editor]
    
    # CSS selector of element, in which the main editable content 
    # of the page will be placed. Required.
    
        content_selector = "#content"
    
    # Local server port. Optional.
    
        local_server_port = 9999
    
    # Default metadata for newly created pages. Optional.
    
        default_meta.tags = "" 
        default_meta.type = "page"

    [output]

    # Directory, relative to site dir where the generated files will be placed.
    
        dir = "static"

    # Time difference in hours between time in source files and local time
    # of generating host. Optional.
    
        time_diff = 0
        debug = false

    # Max number of entries in lists (index pages, tag pages). Required.
    
        list_max = 10

    # Default date, if no date specified. Optional.
    
        default_date = "1999.08.20 16:00"

    [markdown]
    
    # If there are links to markdown files, replace extension 
    # of link target to .html. Optional.
    
        fix_links = true 
    
    # Generate html from markdown files without frontmatter. Optional.
    
        force_source = false

    [tags]
    
    # Directory for generated tag pages. Required.
    
        dir = "/tags/"

    [rss]
    
    # URI of RSS feed. Required.
    
        uri = "/rss.xml"
    
    # Number of entries in RSS field. Optional.
    
        count = 20

    [publish]
    
    # Publish command. Optional.  
    
        command = ""
    
    # Publish command arguments. Optional.
    
        args = ""

    [themes]
    
    # Enable themes. Required.
    
        enabled = false
    
    # Selected theme name. 
    
        theme = "default"


