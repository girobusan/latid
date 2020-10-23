var nunjucks = require('nunjucks');
var md = require('markdown-it')({html:true})
.use(require('markdown-it-multimd-table') , {multiline: true , rowspan: true , headerless: true});


export function dumbViewer() {
    this.show = function (c) {
        //l4.debug("show content")
        //d3elem.html(c);
        return c;
    }
}

export function MdViewer(){
    this.show = function(m){
        return md.render(m.replace("<!--cut-->" , ""));
    }
}
//
var block_templates_cache = {};
//
const blockViews = {
    
    "markdown" : function(block){
        return '<span class="markdown">' + md.render(block.data.markdown) + '</span>' ;

    },
    "badge": function(block){

        return `<${block.data.tag} class="badge ${block.data.class}">${block.data.text}</${block.data.tag}>`

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
            //console.log("not in browser context")
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
    /*
    title: tinput.value,
            href: srcinput.value,
            filename: srcinput.value.split(/\/\\/g).pop() || "",
            extension: srcinput.value.split(".").pop() || "default",
            class: clinput.value

    */
    "attachment": function(block){
        if (block.data.hidden){
            return ""; 
        }
        let title = block.data.title || block.data.filename;
        let classes = block.data.class || "";
        classes += " " + "ext_"+block.data.extension;
        let href= block.data.href || "";

        return `<div class="download ${classes}"><a href="${href}" target="_blank" >${title}</a></div>`


    },
    //TMP
    "download" : function(b){
        return this.attachment(b)
    },

    "image": function (block) {

        let figclass = "";
        let imgclass = "";
        let caption = block.data.caption;
        let src = block.data.file.url;
        let href = block.data.link;

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
        //image link or not
        var imgtag = ""
        if(href){
            imgtag = `<a href="${href}"><img src="${src}" class="${imgclass}"></img></a>`
        }else{
            imgtag = `<img src="${src}" class="${imgclass}"></img>`
        }
        //return caption ? figandcaption : figonly;
        if (caption) {
            return `<figure class="${figclass}">
            ${imgtag}
            <figcaption>${caption}</figcaption>
            </figure>`;
        } else {
            return `<figure  class="${figclass}">
            ${imgtag}
            </figure>`;
        }

    }
}

export function blockViewer(settings) {
    this.show = function (contentjson) {
        //console.log(contentjson);
        var stringHTML = "";
        if (contentjson && "blocks" in contentjson && Array.isArray(contentjson.blocks)) {
            //console.log("CTJSBLC" , contentjson)
            contentjson.blocks.forEach(function (b) {
                //check if there a custom template
                if(b.type in settings.block_templates){
                        console.log("custom block" , b.type)
                //  if so, check if there an already compiled version of it
                        if(!(b.type in block_templates_cache)){ //if not, compile
                            console.log("compile" , b.type)
                            block_templates_cache[b.type] = nunjucks.compile(settings.block_templates[b.type])
                        }                //         
                //  then use
                stringHTML += block_templates_cache[b.type].render(b);                
                }//else use default viewer:
                else if (b.type in blockViews) {
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

export function renderThis(view , settings) {
    let v = null;
    //console.log(view.uri);
    if (view.file.content_format == "blocks") {
        //console.log("Content render: blocks")
        v = new blockViewer(settings);
    } else if (!("content_format" in view.file) || view.file.content_format == "raw"){
        //console.log("Content render: raw")
        v = new dumbViewer();
    }else if (view.file.content_format == "markdown"){
        //console.log("Content render: markdown")
        v = new MdViewer();
    }
    return v.show(view.file.content);
}