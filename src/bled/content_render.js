/*
No DOM version
*/
//const markdown = require( "markdown" ).markdown;
var md = require('markdown-it')({html:true})
.use(require('markdown-it-multimd-table') , {multiline: true , rowspan: true , headerless: true});

//var md = MarkdownIt;

//const markdown = {
    //"toHTML" : md.render
//}


export function dumbViewer() {
    this.show = function (c) {
        //l4.debug("show content")
        //d3elem.html(c);
        return c;
    }
}

//
const blockViews = {
    "markdown" : function(block){
        return '<span class="markdown">' + md.render(block.data.markdown) + '</span>' ;

    },
    "paragraph": function (block) {
        return "<p>" + block.data.text + "</p>";
    },  
    "raw" : function(block){
        return block.data.html;
    },
    "code": function (block) {
        return "<pre><code>" + block.data.code + "</code></pre>";
    },
    "quote": function (block) {
        let text = block.data.text;
        let author = block.data.caption ? block.data.caption : null;

        if (author) {
            return `<blockquote>${text}<footer>
            <cite>${author}</cite></footer></blockquote>`;
        } else {
            return `<blockquote>${text}</blockquote>`;
        }
    },

    "header": function (block) {
        var tagname = "h" + block.data.level;
        return "<" + tagname + ">" + block.data.text + "</" + tagname + ">"
    },

    "script": function(block){
        let did = block.data.id;
        let sr = block.data.url;
        try{
            let prevscr = document.createElement("script");
            prevscr.src = block.data.url;
            document.head.appendChild(prevscr);
        }catch{
            console.log("not in browser context")
        }
        return `<div id="${did}"></div><script src="${sr}"></script>`
    },
    "audio": function(block){
        let sr = block.data.file.url;
        let params = " ";
        if(block.data.autoplay){
            params +="autoplay ";
        }
        if(block.data.loop){
            params +="loop ";
        }
        if(block.data.controls){
        params +="controls ";
        }
        if(block.data.preload){
            params +="preload ";
        }
        return `<audio src="${sr}" ${params}></audio>`

    },
    "video": function(block){
        
        let sr = block.data.file.url;
        let params = "";
        if(block.data.autoplay){
            params +="autoplay ";
        }
        if(block.data.loop){
            params +="loop ";
        }
        if(block.data.controls){
            params +="controls ";
        }
        if(block.data.preload){
            params +="preload ";
        }
        if(block.data.poster){
            params +='poster="' + block.data.poster +'" ';
        }
        
        return `<video src="${sr}" ${params}></video>`
        
    },

    "list" : function(block){

        let inside = "";
        block.data.items.forEach(e=> inside += "<li>" + e + "</li>");
        return block.data.style=="ordered" ? `<ol>${inside}</ol>` :  `<ul>${inside}</ul>` ;
    } ,
    "divider": function(block){
        return "<hr />"
    },

    "image": function (block) {

        let figclass = "";
        let imgclass = "";
        let caption = block.data.caption;
        let src = block.data.file.url;

        if (block.data.withBorder) {
            imgclass += " bordered";
        }
        if (block.data.withBackground) {
            figclass += " with_background";
        }
        if (block.data.stretched) {
            figclass += " stretched";
        }
        if (block.data.left) {
            figclass += " left";
        }
        if (block.data.right) {
            figclass += " right";
        }
        if (block.data.noresize) {
            figclass += " noresize";
        }
        //return caption ? figandcaption : figonly;
        if (caption) {
            return `<figure class="${figclass}">
            <img src="${src}" class="${imgclass}">
            <figcaption>${caption}</figcaption>
            </figure>`;
        } else {
            return `<figure  class="${figclass}">
            <img src="${src}" class="${imgclass}">
            </figure>`;
        }

    }
}

export function blockViewer() {
    this.show = function (contentjson) {
        //console.log("STARTING" , contentjson);
        var stringHTML = "";
        if (contentjson && "blocks" in contentjson && Array.isArray(contentjson.blocks)) {
            //console.log("CTJSBLC" , contentjson);
            contentjson.blocks.forEach(function (b) {
                if (b.type in blockViews) {
                    stringHTML += blockViews[b.type](b);
                } else {
                    //console.log("block", b.type, "not implemented yet");
                    stringHTML += "<div style = 'color:red;'> Not implemented: " + b.type + "</div>"
                };
            });
        }
        //d3elem.html(stringHTML);
        return stringHTML;
    }
}

export function renderThis(view) {
    let v = null;
    //console.log(view.uri);
    if (view.file.content_format == "blocks") {
        v = new blockViewer();
    } else {
        v = new dumbViewer();
    }
    return v.show(view.file.content);
}