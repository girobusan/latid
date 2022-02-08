---
title: Custom scripts
---
This feature is new and something about it can be changed.

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

\* may require external tools

Script format
-------------
Each script must evaluate to an object with properties "title" and "hooks",
where `title` is a short descriptive string, and `hooks` is an array
of two-element arrays. Each of two-element arrays must contain hook 
identifier as string as first element and handler function as second.

Try not to define variables or functions on top level of the script, keep everything
inside.

    //example of custom script file content
    
    new (function(){
       this.title = "Cool&Custom"
       this.hooks = [
         ["all_loaded" , (v)=>console.log("There was" , v.length , "files")],
         ["all_saved" , (v)=>console.log("Okay, we're done")]
         ]

    })();


Hooks
-----

| id          | description                           | handler 1st arg. | 2nd arg. | handler must return | status     |
|-------------|---------------------------------------|------------------|----------|---------------------|------------|
| all_loaded  | called when all files are loaded first time | [views](view.md) list | no | views list     | tested     |
| all_ready   | files are loaded and virtual pages ready    | views list          | no   | views list     | not tested |
| one_content | called on prepared content html before saving    | html as string | view | html as string | not tested |
| one_html    | called on prepared whole page html before saving | html as string | view | html as string | tested     |
| one_saving  | called on every file before saving          | view                | no   | view           | not tested |
| all_saved   | after generation of all site files          | views list          | no   | views list     | tested     |


If you define more than one hook-handler pair for the same hook in single script, handlers will be 
executed in specified order. Order of execution of the scripts, defined 
in the different files is not guaranteed. Each subsequent handler of one hook will get the result of previous
as a 1st argument, the second argument will be passed unchanged. 

Variables, available in handler function
---------------------------------------
- `util`  — [util](util.md) module
- `fileops` — [internal file operation](internal_file_operations.md) routines
- `settinds` — site [settings](settings_toml.md), as an object

How to check, if script running in web GUI or command line
----------------------------------------------------------
...in process...

