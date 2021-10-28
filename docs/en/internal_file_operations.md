---
title: Internal file operations
---

Internal file operations are accessible via custom scripts. 

get
---
parameters: path to file
returns: Promise, resolved with file content    


write
-----
parameters: path to file, file content
returns: Promise


writeSync
---------
Synchronous write.
parameters: path to file, file content
returns: status

copy
----
parameters: path from, path to
returns: Promise

getSync
-------
Synchronous get.
parameters: path
returns: file content for known text files (txt, md, js), ArrayBuffer otherwise.

list
----
parameters: path to folder
returns: Promise, which resolves with list of files inside this folder

base
----
String, base path. Usually `/` or just empty.
