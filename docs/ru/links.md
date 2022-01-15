---
title: Links
---
Latid tries to generate site, viewable as from internet, so from local storage. Therefore, 
it rewrites links to relative ones, when possible. There is two options to set links
between pages of Latid-powered site.
<!--cut-->

We'll show examples, written in plain HTML, but the same syntax for uris used in latid GUI and markdown
sources.

Absolute link
-------------
The most basic way to make link is to specify absolute link to page. Note, that you 
have to link to `uri` of generated file, not the source:

    <!--source file is in site/src/dir/file.json-->
    <!--link looks like: -->
    <a href= "/dir/file.html>link!</a>
    
Or in markdown:

    [link text](/dir/file.html)

This link will be rewritten to relative in generated site.
    
"Slashplus" link
----------
You can link file by its attribute. It's convenient, because link will 
stay actual, even when the location of target file is changed. Latid
automatically creates an `id` property for each newly created file, which 
is a good default choice for "slashplus" linking. For example, 
if you have a file with this metadata: 

    ---
    title : some title
    id: a065529a-4ce2-11eb-ae93-0242ac130002
    ...
    name: important_one 
    ...
    ---

You can link this file using slashplus syntax, like this: 

    <a href= "/+id:a065529a-4ce2-11eb-ae93-0242ac130002">Link!</a>
    <!-- or: -->
    <a href= "/+name:important_one">Link!</a>
    
Or in markdown text:
    
    [link](/+name:important_one)
    [link](/+id:a065529a-4ce2-11eb-ae93-0242ac130002)
    


And this link will be rewritten to actual relative link to file. You may use any 
any unique meta attribute for linking in that way. The attribute, used for 
linking, may not be defined for all files, and it's value must not contain
spaces.
