---
title: Ideology
ru: ../ru/ideology.md
---
Latid's design choices are influenced not only by technical and aesthetic considerations, but also by some sort of ideology.

## Focus on the author.

Latid is built for content authors. There is no need to dig into javascript in order to setup a Latid site. There is one directory to keep, one file operation to update software, one skill to run the generator. And freedom to choose any kind of site structure. But note, that by design, static site generators are not the easiest option. Latid still has some learning curve to travel.

## Guerrilla web

Latid is well-suited for use under pressure. Unfortunately, we live in a world where freedom of speech is frequently threatened. State authorities or others can block web sites, prosecute web creators, or cancel them. Therefore, what do you, as a guerrilla web author, need from your site generator?

### Hide and deny

Your site with everything needed for its operation kept in one directory. It is easier to hide it and then deny the very fact that it exists. There are no specific libraries or external modules to keep, and node.js is mostly legal and can be justified on your machine.

### Easy move your authoring work to another computer

You may need to change your working computer at any time. With Latid you only need to install node.js to start working.

### Change hosting provider easily

That's where relative linking comes in handy. Put your site on a dedicated domain, then move it to a jamstack provider, then migrate it to a subdirectory on your comrade server, and it will work.

### Use other communication channels

Relative linking makes the transition to the Dark Web pretty easy. You can even put your site into a zip archive and send it by email. With a small custom script you'll be able to maintain a Gopher or other type of lightweight mirror of your site.

### For all your illegal goals

You, as a guerrilla web creator, may want to make a blog on some forbidden subject, or document collection, or landing page for your recruiting event. Or you would like to have blog and documentation combined. Or... I do not know, and do not want to know. That's why there are absolutely no implications for your site structure in Latid. And if you plan to change structure in future -- use [plus links](links.md) in all your documents, and they will stay intact even if the target document is moved. 
