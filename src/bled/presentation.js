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


