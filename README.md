---
title: Latid README
---
# Latid (l4) &#128031;

Latid is a static site generator, which works as traditional command line utility and|or with browser based GUI (allowing to use block editor). 

It supports _markdown_ source files alongside with it's own JSON format (pretty clean to parse and use with any custom scripts|apps). Works nicely with Jamstack providers like Netify and Amazon Amplify (both tested).

![screenshot](docs/pix/main_gui.png) 

## Concepts & Features

- One dependency install (just drop files in and ensure you have node.js installed)
- Can work as regular command line utility
- Can work with markdown source files (you need to add frontmatter header with at least "title" field)
- Can also work in GUI mode in a browser, with the simplistic block editor
- JSON file format for pages created with block editor
- Nunjucks templates
- Tags 
- Site may have any directory structure 
- There is GUI app for working with the sites

## Planned features.
<small>The marked features are implemented, but will be included in future release</small>

- [ ] _Table_ (csv?) article block
- [ ] List limits customization by page
- [ ] Better GUI style
- [ ] Theming support
- [ ] Working in browser without node.js

## Releases

### 1.8.14b
- Bugs fixed
- Improved UI (error handling)
- Customize rendering of blocks via nunjucks
- _Markdown_ article block
- Custom (per site) default metadata for new files


## How to get 

You have better to download latest release, or:

    git clone git@github.com:girobusan/latid.git
    cd latid 
    npm install
    npm run build_all

The output files now in the **dist** directory.


Setup empty site
----------------
Open distribution folder (dist). Rename the directories:

1. `_config.example` to `_config`
2. `src.example` to `src`

Run server
----------
Assuming you have node.js installed, execute from the site folder:

    node latidserv.js

Then point your browser to http://localhost:9999/ 

## Disclaimer

I'm not a real programmer, so the code is, probably, awful. There are some known problems, including, but not limited to:

- Bad CSS isolation, styles may leak to GUI (fixing)
- Too basic default site design (users have to develop they own)
- Everything is on early stage
- Incomplete documentation (in process)
- Custom JS may work quirky in GUI (there are workarounds)

## Origin of name
**La·tid**  *noun* (zoology) — any member of the [Latidae family](https://en.wikipedia.org/wiki/Latidae).

