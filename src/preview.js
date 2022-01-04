const d3 = Object.assign({}, require("d3-selection"));
const smalltalk = require('./minortalk/lib/smalltalk');

import "./styles/preview.less";
import {
  dumbEditor as DumbEditor
} from "./dumb_editor";
import * as Files from "./files";
import * as Bled from "./bled/blockeditor";
import * as Pathops from "./pathops";
import * as Util from "./util";
const path = require("path");
//prepare messaging
if (!window.l4) { window.l4 = {} };


function writeWithProgress() {
  //console.log("Now playing: nice progress bar")
  const my = this;
  this.chunk = 10;
  this.blockeditor = null;

  this.progress = smalltalk.progress('Latid', 'Generating site...', {
    "cancel": false,
    " buttons": {
      //ok: 'Ok Label',
      cancel: 'Hide',
    }
  });
  this.progress.buttons = {};

  this.callback = function (msg) {
    //console.log(msg);
    //my.loaded +=msg.data.number;

    if (msg.data.status === 'ready') {
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
      console.log("progress" , pcs)
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
    "current": null,
    "publish_start": () => this.current = smalltalk.alert("Latid", "Starting publish command..."),
    "publish_end": () => { if (this.current) { this.current.dialog.remove(); this.current = null }; smalltalk.alert("Latid", "Site published.") },
    "publish_error": () => { if (this.current) { this.current.dialog.remove(); this.current = null }; smalltalk.alert("Latid", "Publish error.") }

  }

  my.listenerOn = false;
  my.viewmode = true;
  my.current_view = null;
  my.current_editor = null;
  my.panel_collapsed = false;
  my.site_root = "";
  my.faulted = false;


  this.init = async function () {
    //console.log("Preview init")
    let sm = await window.l4.producer.getSettings();
    //console.log("Settings are gotten" , sm);
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

    window.onhashchange = function () {
      if(window.location.hash == "#!error"){
        return;
      }
      my.goTo(window.location.hash.substring(2));
    }


    //add event listener for links 

    if (!this.listenerOn) {

      //rewrite (make it better)
      window.addEventListener('error', function (e) {
        const attrs = ["src", "href", "poster"];
        if (!e.target.getAttribute) {
          //console.log("Not our business");
          return;
        }
        //fix links to external resources
        attrs.forEach(function (a) {   // links which starts with / , but not //

          if (e.target.getAttribute(a) && e.target.getAttribute(a).match(/^\/[^\/]/) && !e.target.classList.contains("fix_" + a)) {
            e.target[a] = Util.gluePath(my.src_base, e.target.getAttribute(a));
            e.target.classList.add("fix_" + a);
            e.preventDefault();
          }
        });
      }, true);
      //handle click on links            
      document.addEventListener("click", function (e) {
        if (!e.target) {
          return true;
        }
        //console.log(e);

        let tglink = e.target;

        if (tglink.nodeName != 'A') {
          //TARGET IS NOT A. maybe, we have to go higher (until nearest link or top)
          do {
            tglink = tglink.parentNode;
          } while (tglink && tglink.nodeName != "A" && tglink.nodeName != "BODY" && tglink.nodeName!='HTML')
        }

        if (tglink && tglink.nodeName == 'A' && tglink.getAttribute("href")) {
          e.preventDefault();
          //var slink = tglink.getAttribute("href");
          if (tglink.getAttribute("href").match(/^(http|ftp|news|gopher|\/\/)/)) {
            console.info("External link:", tglink.href);

            smalltalk.confirm("Latid", "It is an external link, follow?")
            .then(function () {
              window.location = tglink;
            })
            .catch(e => e)

          } else {
            let tgl = tglink.href.substring(tglink.href.indexOf("/src") + 4)
            console.info("Internal link:", tglink.href)
            my.goTo(tgl);


          }
        }
        //no links, default handler
        return true;

      })

      this.listenerOn = true;
    } else {
      console.warn("Listeners already on, probably preview.init() called twice")
    }

  }

  this.isEmpty = function () {
    return my.current_view ? false : true;
  }

  this.showError = function(err){
    let error_title = "Generic Error";
    let error_message = "Generic error message";
    let error_action = "Generic error action";

    //console.log("Show fatal error:" , err);
    //if error came from worker
    if(err.data && err.data.type && err.data.type=="no_server"){
      error_title = "Local server down";
      error_message = "Server down or misconfigured. Fix issue and reload the site.";
      error_action = "";

    }else{
      error_title = err.title || error_title;
      error_message = err.message || error_message;
      error_action = err.action || error_action;
    }
    //
    let errorHTML = `<html><head>
    <link rel="stylesheet" type="text/css" id="latid_gui_styles" href="/_system/scripts/l4.css"> 
    <title>Error: ${error_title}</title></head>
    <body id="latid_error_page">
    <div id="content">
    <h1>${error_title}</h1>
    <div id="message">${error_message}</div>
    <div id = "action">${error_action}</div>
    </div>
    </body></html>`
    doc.innerHTML = errorHTML;

  }
  this.exitError = function(msg){
    my.faulted = false;
  }

  this.showEmpty = function () {
    console.log("SHOW EMPTY")
    console.log(this.views);
    //Let's find some variants
    let variants = [];
    var variants_text = "a";
    //Is there an index page?

    let inx = window.l4.producer.getView("/index.hml");
    console.log("Index page found" , inx);
    if(inx){
       variants.push(`Go to the <a href="/src/index.html">main page</a>`)
    };

    //sum up
    if(variants.length>0){
     variants_text = "<h3>Possible actions:</h3><ul>";
     variants_text += variants.reduce((a,e)=>{
     a = a + "<li>" + e + "</li>";
     return a;
     } , "");
     variants_text +="</ul>";
    }else{
    variants_text = "Probably, something went wrong, check site files amd settings"
    }
    

    my.showError({
       title: "No such page",
       message: "No page at this URL, try another",
       action: variants_text
    });
    return;
    /*
    doc.innerHTML = "<html><head></head><body>Probably, we   shoud <a class='create' href='#'>create page</a></body></html>"
    let clink = doc.getElementsByClassName("create")[0];
    clink.addEventListener("click", function () {
      let p = window.location.hash.substring(3).replace(/\.[^.]+$/, ".json");
      //replace state
      my.createPage(null , false , p ).then(function (r) {
        //history.replaceState(r.uri , r.uri , "#!"+r.uri)
        my.goTo(r);
      });
    });
    */
  }

  this.createPage = async function (question, is_index, uri ) {
    //
    if (!question) {
      question = "Name your file (no extension, latin letters, digits and _- only)"
    }
    //

    // let fn =  await smalltalk.prompt("Latid", question, "");
    let fn =  await smalltalk.promptAndChoice("Latid", question,  "Markdown" , " ");

    //...until it's unique or empty
    if (!fn) {
      return;
    }
    // console.log("FN" , fn)
    if (is_index) {
      var fpuri = Util.gluePath(path.dirname(my.current_view.uri), fn[0], "index.html");
    } else {
      var fpuri = Util.gluePath(path.dirname(my.current_view.uri), fn[0] + ".html");
    }
    let isunique = await window.l4.producer.getView(fpuri, "uri");
    //
    if (!isunique.ok) { //not ok means — OK!
      //create empty view - it made from PATH, not URI
      //
      let nv = Files.makeEmptyView(
        "Untitled",
        fpuri.substring(1).replace(/\.html$/, fn[1] ? ".markdown" : ".json" ),
        my.settings.editor !== undefined ? my.settings.editor.default_meta : {},
        fn[1]
      );
      nv.modified = true;
      window.l4.producer.save(nv)
      .then(my.goTo(fpuri));

    } else {
      if (await smalltalk.confirm("Name is already used, do you want to see that page?")) {
        my.goTo(fpuri);
      } else {
        return;
      }
    }
  }

  var fixScripts = function () {
    //
    let st = document.querySelectorAll("script");
    //console.log('Fixing:', st.length);
    st.forEach(function (se, i) {
      //
      let cm = document.createComment((i + 1) + " : script fixed");
      se.parentNode.insertBefore(cm, se);
      se.remove();
      let newscript = document.createElement("script");
      newscript.innerHTML = se.innerHTML;
      let scrattrs = Array.from(se.attributes);
      scrattrs.forEach(a => newscript.setAttribute(a.name, a.value))
      //
      cm.parentNode.insertBefore(newscript, cm);
    })
  }

  this.display = function (uri) {
    console.log("Display", uri);
    window.l4.producer.getHTML(uri, "uri" , true)
    .then(function (h) {
      doc.innerHTML = h.html;
      fixScripts();
      my.attachUI();
    })
    .catch(err => console.error("Can not display:", err))
      ;
  }

  this.goTo = function (uri) {
    //console.log("goTo" , uri)        
    window.l4.producer.getView(uri)
    .then(function (v) {
      //console.log("Get view from worker", v.view);
      if (!v.ok) {
        console.error("Preview: no such view:", uri);
        smalltalk.alert("Latid", "No such page: " + uri + "")
        .then(()=> { 
        //if we where somewhere, go there
        if(my.current_view){history.back()} 
        //if not, show empty
        console.log("empty");
        my.showEmpty();
        })
        //.catch(e=>e);
        return;
      } else if (v.view.type == 'src') {
        my.current_view = v.view;
        my.viewmode = true;
        history.pushState(uri, null, "/#!" + uri);
        //console.log("About to display", v.view);
        my.display(uri);
      } else {
        //it's copy?
        console.info("It's a file", v);
        window.location = (v.view.path);
      }
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

        //console.log("PP" , pp)
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

    //choose editor
    //console.log("my settings" , my.settings)
    let editor_fn =
    my.current_view && my.current_view.file.content_format == "blocks" ? Bled.makeLatidEditor : (a, b, c, d) => new DumbEditor(a, b, c, d);
    let content_selector = my.settings.editor && my.settings.editor.content_selector ? my.settings.editor.content_selector : my.settings.output.content_selector;
    if (my.current_view.file.content_format == "blocks") {
      my.blockeditor = editor_fn(l4,
        content_selector,
      []);
      //console.log("Preview: Setting up browser upload fn")
      my.blockeditor.setUploadFunction(browserUpload);
      //
      my.blockeditor.start(my.current_view.file.content.blocks);
      my.current_editor = my.blockeditor;
    } else {
      console.log("Preview: There are no blocks")
      my.current_editor = editor_fn(l4,
        content_selector,
      my.current_view.file.content);
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
    //console.log("Attaching main UI");
    const bc = "editor_panel_expanded";

    //const delicon = require("./assets/delete-24px.svg");


    function makeButtonHTML(title, fn) {
      var be = d3.select(document.createElement("div")).attr("class", "panel_button");
      //be.style("padding" , "2px")
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
      .html(delicon);

      row.select("svg").style("width", "24px").style("height", "24px");

      row.selectAll("input").on("change",
        function () {
          this.parentNode.classList.add("modified");
        });
        return row;
    }
    d3.select("#viewer_controls").remove();

    //d3.select("head").append("link").attr("rel", "stylesheet").attr("type", "text/css").attr("href", "/_system/styles/preview.css")
    d3.select("head").append("link").attr("rel", "stylesheet")
    .attr("type", "text/css")
    .attr("id" , "latid_gui_styles")
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
      let r = metaedit.selectAll("input").nodes();
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
