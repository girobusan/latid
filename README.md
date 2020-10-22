---
title: Latid README
date:  2020.10.13
---
# </div>Latid &#128031;

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

## Planned features

- [ ] Custom (per site) default metadata for new files
- [ ] _Markdown_ article block
- [ ] _Table_ (csv?) article block
- [ ] List limits customization by page
- [ ] Theming support
- [ ] Working in browser without node.js
- [ ] Customize rendering of blocks via nunjucks

## How to get 

You have better to wait and download release, but for now:


    git clone git@github.com:girobusan/latid.git
    cd latid 
    npm install
    npm run build_all

The output files now in the **dist** directory.

## Disclaimer

I'm not a real programmer, so the code is, probably, awful. There are some known problems, including, but not limited to:

- Bad CSS isolation, styles may leak to GUI (will fix)
- Too basic default site design (users have to develop they own)
- Everything is on early stage
- Lack of documentation (will fix ASAP)
- Custom JS may work quirky in GUI (there are workarounds)

### Latid
(zoology) Any member of the [Latidae family](https://en.wikipedia.org/wiki/Latidae).

