---
title: Latid README
---
# Latid (L4) &#128031;

Latid is a static site generator, which works as traditional command line utility and|or with browser based GUI (allowing to use block editor). 

It works best for multipage sites (tested with >2000 pages) with primary static 
(even completely 
javascript-free) content (blogs, documentation, portfolios).

One of it's goals is to separate author's experience from developer's one — adding and editing content 
is simple, but there is still enough to fiddle around under the hood to
customize design and behaviour.

It supports _markdown_ source files alongside with it's own JSON format (pretty clean to parse and use with any custom scripts|apps). Works nicely with Jamstack providers like Netify and Amazon Amplify (both tested).

![screenshot](docs/pix/main_gui.png) 

## Features

- One dependency install (just drop files in and ensure you have node.js installed)
- Can work as regular command line utility
- Can work with markdown source files (you need to add frontmatter header with at least "title" field)
- Can also work in GUI mode in a browser, with the simplistic block editor
- JSON file format for pages created with block editor
- Nunjucks templates
- Tags 
- Site may have any directory structure 
- There is GUI app for working with the sites ([other repo](https://github.com/girobusan/latid-browser), in process)

## Requirements

You will need node.js, version 11 and up.

The sites, produced with Latid may be completely static and adapted even 
for oldest browsers, but you will need the descent one for using Latid GUI (Latid can 
  work without GUI with some limitations). 

Tested browsers: Firefox, version>68, Chrome, >77. Safari >12 may also work. 



## Plans 
<small>The marked ones are implemented, but will be included in future release</small>
- [ ] More descriptive error handing (preview, editor start)
- [ ] Option to treat Markdown files without frontmatter as a source 
- [ ] Ability to create page, if it's linked, but do not exist on the fly
- [ ] _Table_ (csv?) article block
- [ ] List limits customization by page
- [ ] Themes support
- [ ] Working in browser without node.js

## Releases

### 1.9.1b

- Option to fix links in markdown (.md|.markdown -> .html)
- Make LIST server API more usable
- Figure out file creation date from mtime, if not specified in file
- Improvements to block editor UI
- Cleanup and refactoring

### 1.8.14b
- Bugs fixed
- Improved UI (error handling)
- Customize rendering of blocks via nunjucks
- _Markdown_ article block
- Custom (per site) default metadata for new files


## How to start 

You have better to download latest release and unzip it, or build latid from repo.
It's strongly NOT recommended, but you can:

    git clone git@github.com:girobusan/latid.git
    cd latid 
    npm install
    npm run build_all

The output files now in the **dist** directory.


### Setup empty site

Open distribution folder. Rename the directories:

1. `_config.example` to `_config`
2. `src.example` to `src`

### Run server

Assuming you have node.js installed, execute from the same folder:

    node latidserv.js

Then point your browser to http://localhost:9999/ 

### Some other docs (so far)

1. [Getting started](docs/en/gettingstarted.md)
2. [Config file](docs/en/settings_json.md)
2. [Site directory structure](docs/en/site_directory_structure.md)
2. [On Markdown files](docs/en/markdown_src.md)
2. [On templates](docs/en/templates.md)
2. [Template variables](docs/en/template_vars.md)
2. ["View"](docs/en/view.md)
2. [Command line operation](docs/en/cli.md)
2. [Working with GUI](docs/en/gui.md)

## When the "beta" status will end

There are goals, which must be achieved before removing "beta" status:

1. Finalization of block editor interface design
2. Stabilisation of latid server API (which is not stable now)
3. Clean up console output
4. Remove obsolete code

Other functionality is pretty usable. 

## Disclaimer

I'm not a real programmer, so the code is, probably, awful. There are some known problems, including, but not limited to:

- Too basic default site design (users have to develop they own)
- Everything is on early stage
- Incomplete documentation (in process)
- Custom JS may work quirky in GUI (there are workarounds)

## Origin of name
**La·tid**  *noun* (zoology) — any member of the [Latidae family](https://en.wikipedia.org/wiki/Latidae).

