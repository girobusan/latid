---
title: Adapting your design to GUI
---


When in Latid GUI, pages are not browsed as usual, but rather manipulated with some javascript
magic. If you want to use custom scripts in your design, and want them to
work smoothly in GUI, you have to consider some
technical limitations of that preview mode. 

Most straightforward way to overcome those limitation is to use `editmode` [template variable](template_vars.md) for excluding 
code, which must not be in GUI or to include additional code for preview in GUI.


You can easily pass the `editmode` flag to your page scripts. Put this in
your template, somewhere in html head:

    {%if editmode%}
    <script> 
       window.editmode = true;
    </script>
    {%endif%}

Then, in your script just check window.editmode variable and choose alternative
routine, if needed.

`<BASE>` tag
----------
Latid injects \<base\> tag to pages, displayed in preview mode. Usually it'll look like this:

    <base href='/src/'>

### What does it mean
|  consequence                                           | workaround                                      |
|--------------------------------------------------------|-------------------------------------------------|
| Injecting other `base` will definetely break everyting |  Use template to exclude custom `base` in editmode  | 
| Fetch URLs in custom scripts may not work              | Use relative urls, at least in GUI              |


No `...Loaded` events
---------------------
As pages in GUI are build via javascript, there are no usual events, like "DOMContentLoaded". But on each page change
all scripts are restarted. It means, you actually can detect entering new page, which leads us to simple
workaround:


    function myStuff(){
        //here all your the code go
    }

    // this is your regular event listener

    window.addEventListener("DOMContentLoaded" , myStuff);

    //this one for GUI

    if(document.readyState === 'complete'){ 
        myStuff();
    }

No `location` and hash
------------

Location does not change in GUI. Instead, the hash is used to keep location info.
If you want to check location in your custom script **and** use it in preview
mode, you may add alternative routine to check location in preview, 
by parsing hash.

If your script needs to send user to other page,  e. g. change location --
add alternative routine, which will change hash instead.

With hashes, there are no workaround, you can not mess with hash in 
preview mode.

