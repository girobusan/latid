---
title: Getting started
name: gettingstarted
lang: en
---
There are your first steps in setting up and start using Latid.
<!--cut-->

Prerequisites
-------------
- Installed node.js, version > 11
- Git, if you dare

Install
-------
### By downloading the release:

Download zip file and unzip it. 

### From repo

This method is strongly not recommended, but works.

    git clone git@github.com:girobusan/latid.git
    cd latid 
    npm install
    npm run build_all

Then look for directory named `dist`.


Setup empty site
----------------
Open distribution folder (dist). Rename the directories:

1. `_config.example` to `_config`
2. `src.example` to `src`

Run server
----------
Assuming you have node.js installed, execute from the site folder:

    node latidserv.js

Then point your browser to http://localhost:9999/ You should see something like [that](gui.md).
You also could use -b key, and the adress will be opened for you automagically (hopefully):

    node latidserv.js -b

(in newer versions of latidserv)
