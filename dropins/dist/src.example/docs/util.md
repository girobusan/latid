---
title: Util module
---
This module contains handy functions, which you can use 
in your templates. 

### util.str2date(string)

Converts string representaion of date
to JavaScript Date object.

### util.date2string(Date)

Converts JavaScript Date object to
Latid time string, in format DD.MM.YYYY HH:MM

### util.prettyDate(string)

Attempts to convert JavaScrpt 
date string to Latid date.

### util.translit(string)

Transliterates string, works for most
languages and alphabets.

### util.guessExcerpt([view](views.md))

Returns excerpt of the given view. If excerpt is not defined,
first paragraph. It is preferred method for
getting excerpt to your template.

### util.guessImage(view)

Returns image of article, if image is
not defined, first image from text,
or poster of video, which of them
comes first. You've better to use this,
not just`view.file.meta.image`.
