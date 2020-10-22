console.log("testing");
import * as Editor from "./blockeditor.js";
import * as CRender from "./content_render";

const el = "#content";
var viewmode = true;

var testdata = 
[
    {
       "type":"header",
       "data":{
          "text":"Это — блочный редактор.",
          "level":1
       }
    },
    {
       "type":"paragraph",
       "data":{
          "text":"Он не очень хорош в наборе текстов, хотя и содержит все основные возможности для редактирования текстов. <i>Курсив</i>, индексы<sup>2</sup>&nbsp; и многое другое, например, вставку ссылок и спѣциальных символов."
       }
    },
    {
       "type":"paragraph",
       "data":{
          "text":"Но основной его смысл в том, чтобы собрать страницу из визуальных блоков. Например, список — отдельный блок со своими параметрами."
       }
    },
    {"type":"markdown",
   
   "data": {
      "markdown" : `
      An h1 header
============

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, **bold**, and monospace. Itemized lists
look like:

  * this one
  * that one
  * the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> Block quotes are
> written like so.
>
> They can span multiple paragraphs,
> if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
in chapters 12--14"). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺



An h2 header
------------

Here's a numbered list:

 1. first item
 2. second item
 3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

~~~
define foobar() {
    print "Welcome to flavor country!";
}
~~~

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

~~~python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~



### An h3 header ###

Now a nested list:

 1. First, get these ingredients:

      * carrots
      * celery
      * lentils

 2. Boil some water.

 3. Dump everything in the pot and follow
    this algorithm:

        find wooden spoon
        uncover pot
        stir
        cover pot
        balance wooden spoon precariously on pot handle
        wait 10 minutes
        goto first step (or shut off burner when done)

    Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

[^1]: Footnote text goes here.

Tables can look like this:

size  material      color
----  ------------  ------------
9     leather       brown
10    hemp canvas   natural
11    glass         transparent

Table: Shoes, their sizes, and what they're made of

(The above is the caption for the table.) Pandoc also supports
multi-line tables:

--------  -----------------------
keyword   text
--------  -----------------------
red       Sunsets, apples, and
          other red or reddish
          things.

green     Leaves, grass, frogs
          and other things it's
          not easy being.
--------  -----------------------

A horizontal rule follows.

***

Here's a definition list:

apples
  : Good for making applesauce.
oranges
  : Citrus!
tomatoes
  : There's no "e" in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

Here's a "line block":

| Line one
|   Line too
| Line tree

and images can be specified like so:

![example image](example-image.jpg "An exemplary image")

Inline math equations go in like so: $\omega = d\phi / dt$. Display
math should get its own line and be put in in double-dollarsigns:

$$I = \int \rho R^{2} dV$$

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.`
   
   }},
    {
       "type":"header",
       "data":{
          "text":"Список:",
          "level":3
       }
    },
    {
       "type":"list",
       "data":{
          "style":"ordered",
          "items":[
             "Может быть нумерованным или с «буллитами»",
             "Елементы списка могут иметь <b>любое</b> текстовое форматирование.",
             "Вложенных списков (пока) нет. Все равно они некрасивые"
          ]
       }
    },
    {
       "type":"header",
       "data":{
          "text":"Мультимедиа",
          "level":3
       }
    },
    {
       "type":"paragraph",
       "data":{
          "text":"Самое главное, конечно, в том, что можно вставлять картинки, видео, аудио, цитаты, произвольный HTML код.&nbsp;"
       }
    },
    {
       "type":"header",
       "data":{
          "text":"Примеры",
          "level":3
       }
    },
    {
       "type":"image",
       "data":{
          "stretched":false,
          "right":false,
          "left":false,
          "noresize":false,
          "withBackground":false,
          "border":false,
          "withBorder":false,
          "caption":"Спасибо сайту <a href=\"https://placekitten.com/\">Placekitten.com</a>",
          "file":{
             "url":"https://placekitten.com/g/800/400"
          }
       }
    },
    {
       "type":"paragraph",
       "data":{
          "text":"Иногда абзацы хочется отбить линейками, и это тоже предусмотрено.&nbsp;"
       }
    },
    {
       "type":"divider",
       "data":{
 
       }
    }
 ]

//to onDOM

window.addEventListener("DOMContentLoaded", function () {
    var myel = document.querySelector(el);
    var myeditor = Editor.makeBasicEditor(el);
    const crender = new CRender.blockViewer();
    myeditor.start(testdata);
    goViewMode();

    function goViewMode() { //CR
        viewmode = true;
        testdata = myeditor.save().blocks;
        myeditor.hide();
        //render content
        
        console.log(JSON.stringify(testdata , null , 2))
        myel.innerHTML = crender.show( {blocks:testdata} );

        //testdata = 

    }

    function goEditMode() { //Editor
        viewmode = false;
        myel.innerHTML = "";
        myeditor.show();
    }
    //button
    let btn = document.createElement("input");
    btn.type = "button";
    btn.value= viewmode ? "edit" : "view";
    btn.setAttribute("style" , "position:fixed;top:1rem;right:1rem");
    document.body.appendChild(btn);
    btn.addEventListener("click" , function(e){
        if(viewmode){
            this.value="view";
            goEditMode()
        }else{
            this.value="edit";
            goViewMode()
        }
    })


})


