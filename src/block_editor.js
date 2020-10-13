
import EditorJS from '@editorjs/editorjs';
const d3 = Object.assign({}, require("d3-selection"));

const Header = require('@editorjs/header');
const Quote = require('@editorjs/quote');
const RawTool = require('@editorjs/raw');
const Table = require('@editorjs/table');
const List = require('@editorjs/list');
const CodeTool = require('@editorjs/code');




import ImageTool from '@editorjs/image';
const ShowScript = require("./blocks/ShowScript.js");
const Video = require("./blocks/Video.js");

export function blockEditor(l4, selector , contentjson) {
    const my = this;
    var d3elem = d3.select(selector);
    this.content = "";
    my.editorjs = null;


    if (typeof contentjson !== 'object') {
        l4.err("block editor: wrong content type:", typeof contentjson); //
    } else {
        this.content = contentjson;
    }

    this.start = function () {
        console.log("engage block editor")
        //render(data: OutputData): Promise<void> 
        //editor.render(...)
        if (my.editorjs != null) {
            //console.log
            //my.editorjs.destroy();
            my.editorjs = null;
        }
        console.log(d3elem);
        d3elem.html("");
        d3elem.append("div").attr("id", "block-editor-container");


        my.editorjs = new EditorJS({
            holder: "block-editor-container",
            data: my.content,
            tools: {
                raw: RawTool,
                code: CodeTool,
                header: Header,
                quote: Quote,
                
                table: {
                    class: Table,
                    inlineToolbar: true,
                    config: {
                      rows: 2,
                      cols: 3,
                    },
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                  },
                image: {
                    class: ImageTool,
                    config: {
                        uploader: {
                            uploadByFile(file) {
                                return l4.server.uploadFromBrowser(file);                               
                            },//end uploadByFile
                            uploadByUrl(url) {
                                console.log("FILE", url);
                                //l4.server.write(file, 'src/')
                                return new Promise(
                                    function (resolve, reject) {
                                        fetch(url, { mode: 'no-cors' })
                                            .then(
                                                resolve({ "success": 1, "file": { "url": "/kitty.jpg" } }))
                                    });

                            }//end uploadByURL
                        }//end "image" uploader
                    }// end "image" config
                },//end "image" def.
                script: {
                    class: ShowScript,
                    config: {
                      uploader: function uploadByFile(file) {
                        return l4.server.uploadFromBrowser(file);                               
                    },
                    }//end config
                  },
                  video: {
                    class: Video,
                    config: {
                      uploader: function uploadByFile(file) {
                        return l4.server.uploadFromBrowser(file);                               
                    },
                    }//end config
                  }
            }//end tools defs.
        });//Editor.js creation end
    }



    this.save = function (callback) {
        console.log(my)
        my.editorjs.save()
            .then(function (r) {
                l4.log("editor saved something")
                console.log("SAVE", r)
                my.editorjs.destroy();
                //my.editorjs = null;
                callback(r);
            })
            .catch(function (error) {
                //console.log("FUCK", my.editorjs)
                l4.err("editor.js can't save:", error);
            })

    }
}

