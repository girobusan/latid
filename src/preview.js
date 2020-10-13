const d3 = Object.assign({}, require("d3-selection"));
//var Dialogs = require('dialogs');
const smalltalk = require('./smalltalk');




/*..import {
    blockEditor as BlockEditor
} from "./block_editor";

*/
import "./styles/preview.less";
//import * as BledUI from "./bled/ui";
import {
    dumbEditor as DumbEditor
} from "./dumb_editor";
//import * as Writer from "./writer_fn";
//import * as Server from "./server_adapter";
import * as Files from "./files";
import * as Bled from "./bled/blockeditor";
import * as NTemplate from "./nunjucks_template";
//import * as Views from "./views";
//import * as Formats from "./formats";
import * as Pathops from "./pathops";
import * as Util from "./util";
const path = require("path");
//import * as Rewriter from "./link_replacer";
//require("./styles/preview.less");
//prepare meaaging
if(!window.l4){window.l4={}};




function writeWithProgress() {
    console.log("Now playing: nice progress bar")
    const my = this;
    this.chunk = 10; 
    this.blockeditor = null;
    //my.loaded = 0;

    
    this.progress = smalltalk.progress('Latid', 'Generating site...' , {
        "cancel": false,
       " buttons": {
            //ok: 'Ok Label',
            cancel: 'Hide',
        }
    });
    this.progress.buttons = {};

    this.callback = function (msg) {
        console.log(msg);
        //my.loaded +=msg.data.number;

        if (msg.data.status==='ready') {
            console.info("Ready")
            my.progress.setProgress(100);
           //my.percent = 100;
            //my.update(100);
            //setTimeout(my.destroy, 1000); //1000
        } else if (msg.data.number == 0) {
            console.info("progress 1")
            //my.bar.style("transition", "width .2s");
            my.progress.setProgress(1);
        } else {            
            let pcs = Math.round((msg.data.number / msg.data.of) * 100);
            pcs = pcs > 100 ? 100 : pcs;
            my.progress.setProgress(pcs);
            
        }
        // console.log(msg.data.number , msg.data.from , msg.data.number/msg.data.from , msg);
    }

    window.l4.producer.registerCallback("generateAll", my.callback);
    window.l4.producer.generateAll();
}


export function preview() {
    const doc = window.document.documentElement;
    const my = this;
    //messaging
    window.l4.messages = {
        "current" : null,
        "publish_start" : ()=> this.current = smalltalk.alert("Latid" , "Starting publish command...") ,
        "publish_end" : ()=> {if(this.current){this.current.dialog.remove() ; this.current = null} ; smalltalk.alert("Latid" , "Site published.")},
        "publish_error" : ()=> {if(this.current){this.current.dialog.remove() ; this.current = null} ; smalltalk.alert("Latid" , "Publish error.")}

    }


    //my.files = new Files.fileMaker(l4);
    //my.lister = l4.lister;
    my.listenerOn = false;
    my.viewmode = true;
    my.current_view = null;
    my.current_editor = null;
    my.panel_collapsed = false;
    //my.bled = Bled.makeTypicalEditor();
    let loader = window.localFS ? new NTemplate.serverLoader() : null; //:TMP
    my.site_root = window.localFS ? window.localFS.root : ""; //:TMP

    this.template = new NTemplate.template(l4.views, l4.settings, l4.meta, loader);

    this.init = async function () {
        let sm = await window.l4.producer.getSettings();
        console.log("Settings are gotten")
        my.settings = sm.settings;
        //let bs = await window.l4.producer.getBase("/src/fcuk.js");
        this.src_base = "/src/"; //bs.base; //FIXME

        //history

        window.onpopstate = function (s) {
            //console.log("STATE", s.state)
            if (s.state) {
                my.display(s.state)
            }
        }


        //add event listener for links 

        if (!this.listenerOn) {
            //fix attributes in __edit mode__
            //rewrite (make it better)
            window.addEventListener('error', function (e) {
                const attrs = ["src", "href", "poster"];
                //console.log('Suspicious error at', e.target);
                if (!e.target.getAttribute) {
                    //console.log("Not our business");
                    return;
                }
                //console.log("fix" , e.target.src , "to" , my.src_base)
                attrs.forEach(function (a) {
                    if (e.target.getAttribute(a) && e.target.getAttribute(a).startsWith("/") && !e.target.classList.contains("fix_" + a)) {
                        e.target[a] = Util.gluePath(my.src_base, e.target.getAttribute(a));
                        e.target.classList.add("fix_" + a);
                        e.preventDefault();
                    }
                });
            }, true);
            //click on links            
            document.addEventListener("click", function (e) {
                //return;
                if (!e.target) {
                    return;
                }

                let tglink = e.target;
                if (tglink.nodeName != 'A') {
                    //TARGET IS NOT A. maybe, we have to go higher
                    do {
                        tglink = tglink.parentNode;
                    } while (tglink && tglink.nodeName != "A" && tglink.nodeName != "BODY")
                }

                if (tglink.nodeName == 'A') {
                    e.preventDefault();
                    //var slink = tglink.getAttribute("href");
                    if (tglink.getAttribute("href").match(/^(http|ftp|news|gopher)/)) {
                        console.info("External link:", tglink.href);
                        window.location = tglink;

                        return false;
                    }
                    let tgl = tglink.href.substring(tglink.href.indexOf("/src") + 4)
                    console.log("Target", tgl)
                    my.goTo(tgl);
                    return;

                }
                //default
            });
            //http requests

            //
            this.listenerOn = true;
        } else {
            console.warn("Listeners already on, probably preview.init() called twice")
        }

    }

    this.isEmpty = function () {
        return my.current_view ? false : true;
    }

    this.showEmpty = function () {
        console.log("SHOW EMPTY")
        doc.innerHTML = "<html><head></head><body>Probably, we shoud <a class='create' href='#'>create page</a></body></html>"
        let clink = doc.getElementsByClassName("create")[0];
        clink.addEventListener("click", function () {
            let p = window.location.hash.substring(3).replace(/\.[^.]+$/, ".json");
            //replace state
            my.files.createNew(p).then(function (r) {
                //history.replaceState(r.uri , r.uri , "#!"+r.uri)
                my.goTo(r);
            });
        });
    }

    this.createPage = async function (question, is_index) {
        //ask filename
        if (!question) {
            question = "Name your file (no extension, latin letters and digits only)"
        }        

       let fn = await smalltalk.prompt("Latid", question, "");

        //...until it's unique or empty
        if (!fn) {
            return;
        }
        if (is_index) {
            var fpuri = Util.gluePath(path.dirname(my.current_view.uri), fn, "index.html");
        } else {
            var fpuri = Util.gluePath(path.dirname(my.current_view.uri), fn + ".html");
        }
        let isunique = await window.l4.producer.getView(fpuri, "uri");
        //
        if (!isunique.ok) { //not ok means — OK!
            //create empty view - it made from PATH, not URI
            let nv = Files.makeEmptyView("Untitled", fpuri.substring(1).replace(/\.html$/, ".json"));
            nv.modified = true;
            window.l4.producer.save(nv)
                .then(my.goTo(fpuri));

        } else {
            if (confirm("Name is already used, do you want to see that page?")) {
                my.goTo(fpuri);
            } else {
                return;
            }
        }
    }

    var fixScripts = function () {
        //console.log('Fix scripts')
        let st = document.querySelectorAll("script");
        console.log('Fixing:', st.length);
        st.forEach(function (se, i) {
            //console.log("Fixing" , se)
            let cm = document.createComment((i + 1) + " : script fixed");
            se.parentNode.insertBefore(cm, se);
            se.remove();
            let newscript = document.createElement("script");
            newscript.innerHTML = se.innerHTML;
            let scrattrs = Array.from(se.attributes);
            scrattrs.forEach(a => newscript.setAttribute(a.name, a.value))
            //newscript.src = se.src;
            cm.parentNode.insertBefore(newscript, cm);
        })
    }

    this.display = function (uri) {
        //console.log("Display", uri);
        window.l4.producer.getHTML(uri, "uri")
            .then(function (h) {
                doc.innerHTML = h.html;
                fixScripts();
                my.attachUI();

            })
            .catch(err => console.error("Can not display", err))
            ;


    }

    this.goTo = function (uri) {
        //console.log("goTo" , uri)        
        window.l4.producer.getView(uri)
            .then(function (v) {
                //console.log("Get view from worker", v.view);
                if (!v.ok) {
                    console.error("Preview: no such view:", uri);
                    return;
                }
                my.current_view = v.view;
                my.viewmode = true;
                history.pushState(uri, null, "/#!" + uri);
                //console.log("About to display", v.view);
                my.display(uri);
            })

    }

    this.makeEditor = function () {
        console.log("Preview: Creating editor")
        //var my = this;
        //br//Function for editorowser upload

        async function browserUpload(fil) {
            console.info("Browser upload:", fil)
            let pp = await window.l4.producer.findFreePath(
                Util.gluePath("uploads/", Pathops.getDir(my.current_view.path), fil.name))

            let readr = new FileReader();
            
            console.log("PP" , pp)
            //let ro = 
            return new Promise(function (res, rej) {
                readr.onloadend = function (e) {
                    window.l4.producer.saveBinary(pp.path, e.target.result)
                        .then(function () {
                            res({
                                "success": 1,
                                "file": { "url": "/" + pp.path }
                            });
                        });
                };
                readr.readAsArrayBuffer(fil);
            });
        };



        //}

        //end browser upload

        my.current_view.modified = true;
        my.viewmode = false;
        //let editor_element = d3.select(l4.settings.content_selector);

        //if editor ready
        /*
        if (my.current_editor && my.blockeditor && my.current_view.file.content_format == "blocks") {
            console.log("Editor already here");
            my.blockeditor.setBlocks(my.current_view.file.content.blocks);
            my.blockeditor.show();
            return;
        }
        if (my.current_editor && (!my.current_view.file.content_format || my.current_view.file.content_format != "blocks")) {
            console.log("Dumb editor already here");
            my.current_editor.start(my.current_view.file.content);
            my.current_editor.show();
            return;
        }
        */
        //let testbled = Bled.makeBasicEditor(l4.settings.content_selector);
        //choose editor
        let editor_fn =
            my.current_view && my.current_view.file.content_format == "blocks" ? Bled.makeLatidEditor : (a, b, c, d) => new DumbEditor(a, b, c, d);

        if (my.current_view.file.content_format == "blocks") {
            my.blockeditor = editor_fn(l4, my.settings.output.content_selector, []);
            console.log("Preview: Setting up browser upload fn")
            my.blockeditor.setUploadFunction(browserUpload);
            //console.log("after setup", my.blockeditor);
            my.blockeditor.start(my.current_view.file.content.blocks);
            my.current_editor = my.blockeditor;
        } else {
            console.log("Preview: There are no blocks")
            my.current_editor = editor_fn(l4, my.settings.output.content_selector, my.current_view.file.content);
            my.current_editor.start(my.current_view.file.content);
        }
    }
    this.switchToView = async function () {
        console.log("Switch to view mode.")
        my.viewmode = true;
        if (my.current_view.modified) {
            my.current_view.file.content = my.current_editor.save();
            my.current_view.modified = false;
            //save it to prod
            await window.l4.producer.save(my.current_view);
        }
        my.display(my.current_view.uri);
    }

    this.attachUI = function () {
        //return;
        console.log("Attaching main UI");
        const bc = "editor_panel_expanded";

        //const delicon = require("./assets/delete-24px.svg");


        function makeButtonHTML(title, fn) {
            var be = d3.select(document.createElement("div")).attr("class", "panel_button");

            be.html(title);
            be.on("click", fn);
            return be.node();
        }

        function addLine(d3sel) {
            var row = d3sel
                //.append("div")
                .attr("class", "formrow")
            //.style("display", "flex");
            //.style("align-content", "stretch");

            row.append("input").attr("class", "metaname")
                .attr("type", "text")
                .attr("contenteditable", true)
                .attr("list", "metaeditor_hints")
                .attr("value", d => d ? d.name : "");

            row.append("input").attr("class", "metavalue")
                .attr("type", "text")
                .style("margin-right", "2px")
                .attr("value", d => d ? d.value : "");

            row.append("div").attr("class", "panel_button small minus")
                .style("margin", "2px")
                .on("click", function () {
                    this.parentNode.remove();
                })
                .html(delicon)

            row.selectAll("input").on("change",
                function () {
                    //console.log('CHANGE');
                    //console.log(this.value)
                    this.parentNode.classList.add("modified");
                    //this.style.backgroundColor = "yellow"
                });
            return row;
        }
        d3.select("#viewer_controls").remove();

        //d3.select("head").append("link").attr("rel", "stylesheet").attr("type", "text/css").attr("href", "/_system/styles/preview.css")
        d3.select("head").append("link").attr("rel", "stylesheet").attr("type", "text/css")
            .attr("href", path.join(my.site_root, "/_system/scripts/l4.css"));
        let vtt = VERSION;
        let panel = d3.select("body")
            .append("div")
            .attr("id", "viewer_controls")
            .classed("warn", my.current_view.modified == true)
            .html("<div id='latid_panel_title'><div>Latid</div><div>" + vtt + "</div></div>")

            ;



        panel.append("div")
            .attr("class", "switch")
            .on("click", function () {

                panel.classed("hidden", !panel.classed("hidden"));
                my.panel_collapsed = panel.classed("hidden");
                d3.select("body").classed(bc, !panel.classed("hidden"));
            })
        //console.log("LET US PANEL" , panel)
        d3.select("body").classed(bc, panel && !panel.classed("hidden"));

        //panel content
        //common buttons
        var cbuttons = panel.append("div").attr("class", "subpanel common");
        //view/edit
        cbuttons.node().appendChild(makeButtonHTML("view/edit", function () {
            if (my.viewmode) {
                my.makeEditor();
            } else {
                my.switchToView();
            }
        }));
        cbuttons.node().appendChild(makeButtonHTML("save current", function () {
            if (!my.current_view.modified) {
                console.info("No modification made for", my.current_view.uri);
                return;
            }
            //l4.log("saving", my.current_view);
            if (my.current_view.virtual) {
                my.current_view.virtual = false;
            }
            //switch to edit mode
            if (my.viewmode) {
                my.makeEditor();
            }
            //editor save!!!   
            my.current_view.file.content = my.current_editor.save();
            my.current_view.modified = false;
            my.switchToView();
            //my.current_view.file.content = my.current_editor.save();            
            window.l4.producer.save(my.current_view).then(my.display(my.current_view.uri))

        }));

        cbuttons.node().appendChild(makeButtonHTML("+ page", my.createPage));

        cbuttons.node().appendChild(makeButtonHTML("+ dir", function () {
            my.createPage("Name the directory (latin letters, digits, -_)", true);
        }));


        cbuttons.node().appendChild(makeButtonHTML("generate site", function () {
            new writeWithProgress();
        }));

        //meta editor
        let delicon = require("./assets/delete-24px.svg")
        let metadatas = Object.keys(my.current_view.file.meta)
            .map(k => ({
                "name": k,
                "value": my.current_view.file.meta[k]
            }));
        let metahints = ["title", "tags", "excerpt", "image", "nolist", "date", "id", "name", "list", "list_custom", "list_criteria", "include_regexp", "exclude_regexp"];
        //hints
        let dlist = document.createElement("datalist");
        dlist.id = "metaeditor_hints";
        metahints.forEach(e => {
            let op = document.createElement("option");
            op.value = e;
            dlist.appendChild(op)
        });
        document.body.appendChild(dlist);



        let metaedit_panel = panel.append("div").attr("class", "subpanel metaeditor");
        let metaedit = metaedit_panel.append("div").attr("class", "inputs")
        let lines = metaedit.selectAll("div").data(metadatas)
            .enter()
            .append("div")
            .call(addLine);

        metaedit_panel.node().appendChild(makeButtonHTML("commit", function () {

            //this.style.backgroundColor = "yellow"
            let r = metaedit.selectAll("input").nodes(); //.call(touch);
            //console.log(r);
            let r2 = Array.from(r).map(e => e.value);
            my.current_view.file.meta = {};
            for (let i = 0; i < r2.length; i += 2) {
                my.current_view.file.meta[r2[i]] = r2[i + 1];
            }

            metaedit.selectAll(".formrow").classed("modified", false);
            my.current_view.modified = true;
            panel.classed("warn", true)
            console.log(my.current_view.file.meta)

        }));

        metaedit_panel.node().appendChild(makeButtonHTML("reset", function () {

            metaedit.html("");
            metaedit.selectAll("div").data(metadatas)
                .enter()
                .append("div")
                .call(addLine);

        }));

        metaedit_panel.node().appendChild(makeButtonHTML("+ meta", function () {
            addLine(metaedit.append("div")).classed("modified", true);
        }));
        panel.classed("hidden", my.panel_collapsed);
        d3.select("body").classed(bc, !panel.classed("hidden"));
    };
};