---
title: Latid README
---
<span style='color:#00a1ab'>
<h1 style='font-size:4rem'> Latid (L4)</h1>
</span>

![Latid](docs/pix/readme_image.png)

Latid is a portable static site generator, oriented towards content authors, 
therefore [pretty simple in use](docs/en/required_knowledge.md). All the required functionality
included and enabled, (almost) no programming knowledge required to set up and operate.


It works as traditional command line utility and/or with browser based GUI 
(allowing to use block editor). There is also a [GUI app](https://github.com/girobusan/latid-browser) 
for hassle-free working with Latid sites.


It works best for multipage sites (tested with >2000 pages) with primary static 
(even completely javascript-free) content (blogs, documentation, portfolios).

It's in active use, tested and is pretty mature.

([There are some docs](docs/en/index.md))

## Features

- One dependency (node.js), no install, just drop in
- Dead simple content editing via GUI (optional)
- JSON source file format, semantic and reusable via other frontends
- Markdown source files can be used as well
- Custom scripts for customization of generation process
- Command line utility, [jamstack](https://jamstack.org)-friendly
- Nunjucks templates with all its might
- Automatic paginated lists
- Tags, persistent and transient tag pages, tags in almost any language

![screenshot](docs/pix/readme_cover.png) 

## Requirements

You will need node.js, version 11 and up.

The sites, produced with Latid may be completely static and adapted even 
for oldest browsers, but you will need the descent one for using Latid GUI (Latid can 
  work without GUI, GUI is just another way to edit site content,
  if you prefer to work without GUI, you'd have to use only `markdown` files as source). 

Tested browsers: Firefox, version>68, Chrome, >77. Safari >12 _may_ also work. 

## Plans (will be implemented sooner or later)
<small>The marked ones are implemented, but not included in current release</small>

- [ ] Better WYSIWYG in block editor
- [ ] Rework local server (cleaner API)
- [ ] Create markdown files from GUI
- [ ] Time-aware generation 

### Maybe plans (_may_ be imlemented)

- [ ] Hosted version 
- [ ] Ability to create page, if it's linked, but do not exist on the fly


## How to start 

Install [node.js](https://nodejs.org) to your computer.

You have better to download latest release and unzip it. You also can build latid from repo.
It's strongly NOT recommended, but you can:

    git clone git@github.com:girobusan/latid.git
    cd latid 
    npm install
    npm run build_all

The output files now in the `dist` directory.


### Setup empty site

Open distribution folder. Rename the directories:

1. `_config.example` to `_config`
2. `src.example` to `src`

### Run server

Assuming you have node.js installed, execute from the same folder:

    node latidserv.js

Then point your browser to `http://localhost:9999/` 

### Documentation

1. [Getting started](docs/en/gettingstarted.md)
2. [Config file](docs/en/settings_json.md)
2. [Site directory structure](docs/en/site_directory_structure.md)

[More...](docs/en/index.md) 

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
- Incomplete documentation (in process)
- Custom JS may work quirky in GUI (affects only GUI preview, there are workarounds)

## Origin of name
**La·tid**  *noun* (zoology) — any member of the [Latidae family](https://en.wikipedia.org/wiki/Latidae).

## Image source

https://commons.wikimedia.org/wiki/File:Psammoperca_vaigiensis.jpg

This image is Crown Copyright because it is owned by the Australian Government 
or that of the states or territories, and is in the public domain because 
it was created or published prior to 1971 and the copyright has therefore 
expired. The government of Australia has declared that the expiration 
of Crown Copyrights applies worldwide.

