---
title: Ideology
ru: ../ru/ideology.md
---

Design decisions behind Latid is driven not only by technical and
aesthetic considerations, but also by some kind of ideology.

Focus on author
---------------
Latid is built for content authors. There is no need to dig into javascript in order to
setup Latid site. There is one directory to keep, one file operation to update software,
one skill to run the generator. And freedom to choose any kind of site structure. 

Please, note, that static site generator is not the most simple choice by design. 
Keep it mind, Latid still has some learning curve to travel.

Guerrilla web
------------

Latid is well-suited for use under pressure. Unfortunately, we live
in the world, where freedom of speech is oppressed on regular basis. Web sites are blocked,
either by state authorities or by other parties, web creators prosecuted or _canceled_. So, what 
do you, as guerrilla web author, need from your site geneяatoя?

### Hide and deny

Your site with everything needed for its operation kept in one directory.
It's easy to hide it somewhere and than deny the very fact of its existence.
There are no specific libraries or external modules to keep, and the node.js
is mostly legal and its presence on your computer can be easily justified.


### Easy move your authoring work to other computer

You may need to change your working computer at any time. With Latid you only need to install 
node.js to start working. 

### Change hosting provider easily

That's where the relative linking comes in handy. You may put your site to dedicated domain, than
move it to jamstack provider, and other day -- to some subdirectory at your comrade server, and it will work.

### Use other communication channels

Relative linking makes transition to Dark Web
pretty easy. You can even pack your site to zip archive and send it by email. With small custom script
you'll be even able to maintain Gopher or other type of lightweight mirror of your site.

### For all your illegal goals

You, as a guerrilla web creator,  may want to make 
a blog on some forbidden subject, or documents collection,
or landing page for your recruiting event. Or you would like to have blog and documentation 
combined. Or... I do not know, and do not want to know. That's why there is absolutely no
implications on your site structure in Latid.

And if you plan to change structure in future -- use [plus links](links.md) in all your documents, and they
will stay intact even if target document will be moved.



