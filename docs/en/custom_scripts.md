---
title: Custom scripts
status: draft
---
This is planned feature, and this document is an early draft.

You may extend the functionality of Latid using your own
custom scripts. Scripts are written in Java Script and placed 
in `_config/scripts` directory of your site and its subdirectories, except 
subdirectory `disabled`. 

They're then called according
to certain "hooks" while processing the site. This way custom scripts
can modify the site files, generate new ones, rewrite html and do a whole
lot of interesting stuff.

Words of warning
---------------
Custom scripts have access to all internals of your site, Latid, and even
your computer. Never use scripts from unknown sources, it may ruin everything. 
Check twice. Newer test on the real site. Be paranoid. If you do not explicitly need custom scripts on
your site, _remove_ `_config/scripts` directory from your site directory completely. It's
powerful _and_ really, really dangerous tool.

Possible use
------------

- Gather site statistics
- Postprocess HTML
- Automate article thumbnail creation* 
- Generate multiple feeds in different formats
- AMR generation
- Image optimization*
- Colophon generation

Script format
-------------
Each script must evaluate to an object with properties "title" and "hooks",
where `title` is a short descriptive string, and `hooks` is an array
of two-element arrays. Each of two-element arrays must contain hook 
identifier as string as first element and handler function as second.

    //example of custom script file content
    
    function myScript(){
       this.title = "Cool&Custom"
       this.hooks = [
         ["all_loaded" , (v)=>console.log("There was" , v.length , "files")],
         ["all_saved" , (v)=>console.log("Okay, we're done")]
         ]

    }

    new myScript();

Hooks
-----

| id          | description                                 | handler argument | handler must return | status      |
|-------------|---------------------------------------------|------------------|---------------------|-------------|
| all_loaded  | called when all files are loaded first time | [views](view.md) list  | nothing       | not tested  |
| all_ready   | files are loaded and virtual pages ready    | views list      | nothing             | not tested  |
| one_html    | called on prepared html before saving       | html as string   | html as string      | tested      |
| one_saving  | called on every file before saving          | view             | nothing             | -- |
| all_saved   | after generation of all site files          | views list ?     | nothing             | -- |


Variables, available in handler function
---------------------------------------
- `util`  — [util](util.md) module
- `fileops` — internal file operation routines
- `settinds` — site [settings](settings_json.md), as an object

How to check, if script running in web GUI or command line
----------------------------------------------------------
...in process...

