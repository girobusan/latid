---
title: Latid server API
---
Latid GUI works in browser, and requires tiny local server for communication with file system. 
The server have to support simple API, which is described here. 

| command                       | request type | description | result                    |
|-------------------------------|-----|--------------------|-----------------------------|
| get file                      | GET |  regular http GET  | regular HTTP GET response   |
| /api/list?dir_name            | GET |  directory listing | status object, JSON encoded |
| /api/write?filename           | PUT |  write file        | status object, JSON encoded |             
| /api/copy?from=name1&to=name2 | GET |  copy file         | status object, JSON encoded |         


## Status object

Status object contains request status and details.

1. *status* -- either 'success' or 'failure'
1. *details* -- contains request body

## File listing

The `details` field of successful list response contains files list, which consists of objects with fields: 

1. *path* -- path to file relative to requested dir
1. *mtime* -- modification time string 
1. *mtimeMs* -- modification time as UNIX timestamp


