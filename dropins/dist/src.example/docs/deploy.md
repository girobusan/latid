---
title: Deploy with Latid
---

The deployment with Latid is pretty straightforward. You may either generate 
html files locally and upload them, or setup automatic generation on your VPS.
There are services, which facilitate that work, and may need some additional
configuration.

Services
--------
We'd assume, that your site folder is kept in the root of the git repo. 

### Github Pages
You need to set `output.dir` in settings file to `docs` and keep static files in repository.
        
        "output": {
          "dir": "docs",
          "time_diff": 0,
          "content_selector":...,
          ...
          ...
        }
        
With Github actions you can setup automatic deployment and other interesting
things.

### Netlify
You can .gitignore `static` dir, letting the service to do the job. The build section of your `netlify.toml` may look like this:

    [build]
      base = "."
      publish = "./static"
      command = "mkdir static ; node l4cli.js -t"

As of 2021, basic Netlify build image will work just fine.

### Amazon Amplify
Basically, settings are the same as for Netlify, difference is in config syntax.
