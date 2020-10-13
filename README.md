---
title: Latid&#128031;readme
---
# <div style="font-size:200%;">&#128031;</div>latid

Latid is a static site generator. 

## Concepts & Features

- One dependency install (just drop files in and ensure you have node.js installed)
- Can work as regular command line utility
- Can work with markdown source files (you need to add frontmatter header with at least "title" field)
- Can also work in GUI mode in browser, with simplistic block editor
- JSON file format for pages created with block editor
- Nunjucks templates
- Tags 
- Site may have any directory structure 
- There is GUI app for working with sites

## Planned features

- [] Theming support

## How to get 

You have better to wait and download release, but for now:


    git clone git@github.com:girobusan/latid.git
    cd latid 
    npm install
    npm run build_all


## Disclaimer

I'm not a real programmer, so the code is, probably, awful. There are some known problems, including, but not limited to:

- Bad CSS isolation, styles may leak to GUI (will fix)
- Too basic default site design (users have to develop they own design)
- Everything is early stage
- Lack of documentation (will fix ASAP)

