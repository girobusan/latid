---
title: Java Script workaround 
---

If your site has scripts, which are launched on DOMContentLoaded or something like this, they might not launch in GUI mode. 
<!--cut-->

The problem arises because pages in GUI are not loaded as usual, but redrawn using scripts. So, there is no "loaded" events. Possible workaround may look like this:

    function myStuff(){
        //here all your the code go
    }

    //add this as regular event listener

    window.addEventListener("DOMContentLoaded" , myStuff);

    //this one for GUI

    if(document.readyState === 'complete'){
        myStuff();
    }

