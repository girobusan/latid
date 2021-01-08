---
title: Latid server API
---
Latid GUI works in browser, and requires tiny local server for communication with file system. 
The server have to support simple API, which is described here. Server, written for node.js environment
is included with Latid distribution, but it's pretty easy to implement in almost any language.

| command                       | request type | description | result if success (code 200)| result if failure |
|-------------------------------|-----|--------------------|-----------------------------|---------------------|
| get file                      | GET |  regular http GET  | regular 200 responce        | 404 response        |
| /api/list?dir_name            | GET |  directory listing | status object, JSON encoded | 502 response  |
| /api/write?filename           | PUT |  write file        | status object, JSON encoded | 200 + status object |            
| /api/copy?from=name1&to=name2 | GET |  copy file         | status object, JSON encoded | 200 + status object |        


## Status object

Status object contains request status and details.

1. *status* — either 'success' or 'failure'
1. *details* — contains request body

## File listing

The `details` field of successful list response contains files list, which consists of objects with fields: 

1. *path* — path to file relative to requested directory
1. *mtime* — modification time string 
1. *mtimeMs* — modification time as UNIX timestamp


