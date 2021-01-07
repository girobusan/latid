---
title: File metadata
---

You can add any metadata to your pages, for any use. Custom meta may work well for maintaining non-standard site structure and|or navigation. Some metadata used by engine, including those:
<!--cut-->

### title

Mandatory. Title of the page.

### date

Date in format `YYYY.MM.DD HH:MM` or just `YYYY.MM.DD`.

### tags

Tags, commas-separated. Tags may contain spaces and non-latin characters.

### image

Article image uri.

### excerpt

Article excerpt

### id , name

Actually, not used by engine, but handy to make path-independent links.


### list_custom

Indicates, that page must include custom list of other pages, and specifies, which kind of views it will contain: regular pages, indices or both (pages|dirs|all)

### include_regexp

Regexp, which defines, which views will be included in custom list. For each view in pool uri is tested against given regexp, an if it matches, view included.

### exclude_regexp

Same, but in reverse.

### list_criteria

(Will be used in future) - which field of view to match in order to compose custom list.
