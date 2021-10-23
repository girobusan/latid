

/*

 Platform-independent 
 recipes for system  operations
 (requires save/load routines on init)
 
*/

import * as Views from "./views";
import * as Formats from "./formats";
import * as Listops from "./listops";
//new templating mechanics
import * as Template from "./nunjucks_template"; //loader?
import * as Themes from "./themes";
import * as CRender from "./content_render";
//
import * as Path from "path";
import * as Rewriter from "./link_replacer";
import * as Tags from "./tags.js";
import * as Util from "./util";
import * as RSS from "./rss";
//const fs = require("fs")

//import {TextDecoder} from "util";

var TD = null;//|| require('util').TextDecoder ;

if (typeof TextDecoder !== 'undefined') {
    //console.log("Clobal TextDecoder used.")
    TD = TextDecoder;
} else {
    TD = require("util").TextDecoder;
}


 /*
 {
     get:       f(p),      //async ~
     write:     f(p,c)     //async ~
     writeSync: f(p , c),      //sync  *
     copy:      f(from,to) //async ~
     getSync:   f(p),      //sync  *
     list:      f(p),      //async ~
     base:      string     //base href for views, specific for loader
 }
*/
//localhost
//base = "/src/"  => /src/ + dirname(v.uri)

/*latid-browser
base = "file://path/to/src/"
 
*/
/**
 * 
 * @param {Function} callback  - callback function
 * @param {Number} n  current iteration number
 * @param {Number} t total iterations 
 * @param {String} s  operation status: working|ready
 * @param {String} w work id
 * @returns {Function} callback function whith values encapsulated 
 */

function buildCallback(callback, n, t, s, w) {
    return function () {
        callback({
            operation: w || "load_all",
            number: n,
            of: t,
            status: s || "working"
        });
    }

}




export function routines(fileops) {
    //console.log("We are routines")
    var my = this;
    this.ready = false;
    this.fileops = fileops;
    //views kept inside
    this.views = [];
    //also meta (list of tags)
    this.meta = {};
    //lister
    this.lister = new Listops.lister([]);
    //text decoder
    this.decoder = new TD("utf-8");

    this.getSettings = function () {
        return this.settings;
    }

    this.loadCustomScripts = function(){
    console.info("Loading custom scripts")
    //list _config/scripts
    return this.fileops.list("_config/scripts")
    .then(r=>{
       if(r.length==0){console.info("No custom scripts used");return}
       r.forEach(f=>{

         let d = eval(this.fileops.getSync(Path.join("_config/scripts" , f.path)));
         console.log("Script:" , d);
         let testvar = "Test variable";
         let util = Util;
         console.log(d.procedure("test p"));
         //test("???")
         //d("test in place")
       })
    })
     
    //.catch(e=>console.info("No custom scripts defined"))
    }


    this.updateList = function () {
        //console.log('Update list' , my.views.length);
        let sd = new Date();
        my.views.sort(function (a, b) {
            if (!a.file && !b.file) {
                return 0;
            }
            if (a.file && !b.file) {
                return -1;
            }
            if (!a.file && b.file) {
                return 1;
            }
            //console.log(a,b); //
            let aval = a.file.meta.date && Util.str2date(a.file.meta.date) ? Util.str2date(a.file.meta.date) : sd;
            let bval = b.file.meta.date && Util.str2date(b.file.meta.date) ? Util.str2date(b.file.meta.date) : sd;

            if (aval.getTime() > bval.getTime()) {
                return -1;
            }
            if (bval.getTime() > aval.getTime()) {
                return 1
            }
            return 0;
        })
        my.lister = new Listops.lister(my.views);
    }

    //creates context from view
    //for use in templates
    //optional additional context

    this.view2context = function(view , context){
      let view_context =  {
        "content" : CRender.FrenderThis(view, my.FTemplate), //render
        "meta" : my.meta,
        "list" : new Listops.lister(my.views),
        "settings" : my.settings,
        "view" : view,
        //"editmode":  WorkerGlobalScope !== undefined ,
        "views" : my.views,
        "embed" : function(euri , fn){
           //get view 
           const lister = new Listops.lister(my.views);
           let v = lister.getByField(euri , fn||"uri");

           //CRender
           return CRender.FrenderThis(v, my.FTemplate);

        }
      
      };
      return context ? Object.assign(view_context , context) : view_context;
    }

    this.renderOneFile = function(view , context){
      //context.editmode = true;
      return my.FTemplate("index.njk")(my.view2context(view , context));

    }

    this.getBase = function (pt) {
        return Path.join(this.fileops.base, Path.dirname(pt));// + "/";
    }
    ////////////////
    /// LOADING  ///
    ///////////////

    //one file processing
    //returns ptromise
    this.path2view = function (finfo) {
        //console.log("P2V" , finfo.path);
        //let callback = callback || function () { };
        let tg = function (p) {
            return new Promise(function (res, rej) {
                my.fileops.get(Path.join("src", p))
                    //console.log("got" , p)
                    //.then(async () => { if (callback) { callback() } })
                    .then(r => res(my.decoder.decode(r)))
                    .catch(rej)
            })
        }
        let result = Formats.decodeFileFromPath(finfo.path, tg , finfo , my.settings);
        //console.dir(result);
        //console.log(typeof result);
        return result; //Formats.decodeFileFromPath(p, tg);
    }
    //create virtual pages (tags and multipage)
    // ()=> void //DIRTY
    this.generateVirtuals = function () {

        //remove previous: all virtual pages and all tag pages, virtual or not 
        my.views = my.views.filter(e => !e.virtual);
        //remove all possible virtual references
        my.views.forEach(e => { if (e.tagslist) { e.tagslist = [] } }); //generated lists of tag views
        my.views.forEach(e => { if (e.tagged) { e.tagged = [] } });   //generated tagged lists from non-virtual tag pages
        //create tags
        my.meta.tags = Tags.makeTagsNew(my.views, my.settings);
        //create multipage indices
        //l4.views.forEach(v => Views.makeMultipageIndex(l4, v, l4.views));
        my.views.forEach(v => Views.makeMultipageIndex(null, v, my.views, v => my.views.push(v), my.settings.output.list_max));
        //create multipage tags
        my.views.forEach(v => Views.makeMultipageTag(null, v, v.tagged, v => my.views.push(v), my.settings.output.list_max));
        //create custom multipage lists
        //makeCustomList(l4, v , viewlist , putter , listm)
        my.views.forEach(v => Views.makeCustomList(null, v, my.views, v => my.views.push(v), my.settings.output.list_max));
        //update lister
        my.updateList();
    }
    //load all
    //callback for each 10 read
    // callback, settings => promise => void
    this.loadAll = function (callback) {

        function injectCallback(prom, num, ofn) {
            //console.log("inject:" , num);           
            if (num % 10 != 0) {
                //console.log(num, num%10)
                return prom;
            }
            if (!callback) {
                callback = (r) => console.log(r);
            }

            return new Promise(function (res, rej) {
                prom
                    .then((r) => { buildCallback(callback, num, ofn, "loading")(); res(r) })
                    .catch(e => rej(e))
            })
        }

        return new Promise(function (res, rej) {
            my.fileops.list("src")
                .then(function (r) {
                    //console.log("Fileops list" , r)
                    let filepromises = [];
                    r = r.filter(e => !Path.basename(e.path).match(/^(\.|_)/));
                    r.forEach((e, ix) => filepromises.push(injectCallback(my.path2view(e), ix, r.length)));//
                    let PA = Promise.all(filepromises);
                    //console.dir(filepromises);
                    PA.then(
                        function (r2) {
                            //console.info('All files processed.')
                            my.views = my.views.concat(r2);                            
                            my.generateVirtuals();
                            //my.updateList();                            
                            res();
                        }
                    )
                        .catch(e => { console.error("Can not read all", e , e.stack); rej(e) })
                })
        });
    }

    //////////////
    ///GENERATE///
    //////////////



    //generate html from view and return it as text
    //sync 
    //view creds => html
    this.getHTMLSync = function (val, fld, add_local_base_tag , preview) {
        //var my = this;
        console.info("Get HTML sync")
        this.generateVirtuals();
        //this.updateList()
        if (add_local_base_tag) {
            my.meta.preview = true;
        }
        //my.template = new Template.template(my.views, my.settings, my.meta, my.template_loader);

        let rp = new Rewriter.rewriter(this.views, "/src/" , my.settings);

        let bf = fld || "uri";
        let v = this.lister.getByField(bf, val);
        //console.log("Lister got View" , v)
        if (v) {
          let context = my.view2context(v , {"editmode":true});
          let tr = my.FTemplate("index.njk")(context);
          //let tr = my.template.render(v);
          //console.log("After template" , tr)
          let h = tr;
          h = rp.rewriteAllLinks(tr, v.uri);
          if (!h) {
            console.log("No HTML")
            return null
            }
            if (add_local_base_tag) {
                let lb = Path.join(this.fileops.base, "src/", Path.dirname(v.path));
                lb = lb.endsWith("/") ? lb : lb + "/";
                h = h.replace("<head>", "<head><!--base--><base href='" + lb + "'>");
            }
            return h;
        } else {
            console.error("Can not find", val, "in", fld, my.views);
            return null;
        }
    }

    //get view
    this.getView = function (val, fld) {
        let bf = fld || "uri";
        let v = my.lister.getByField(bf, val);
        return v;

    }

    //generate site from current views set
    //callback => void
    this.generateAll = function (callback) {
        my.meta.preview = false;
        this.generateVirtuals();
        //generate rss
        let rssc = RSS.buildRSS(my.settings, my.views);
        let rsspath = Path.join(my.settings.output.dir, my.settings.rss.uri);
        my.fileops.write(rsspath, rssc)
            .catch(err => console.error("Can not write RSS", err));
        //this.updateList();
        console.info("Preparing to generate", my.views.length, "files")
        //console.log(my.views.map(e=>({"path" : e.path , "uri" : e.uri})))
        let rp = new Rewriter.rewriter(my.views ,false, my.settings);
        //my.template = new Template.template(my.views, my.settings, my.meta, my.template_loader);
        my.views.forEach(function (v, i, a) {
            var myclb = null;
            if (i % 10 == 0 && i < my.views.length && callback) {
              //console.log("CALLBACK");
                myclb = buildCallback(callback, i, my.views.length, "working", "generate_site");
            } else if (i == my.views.length - 1 && callback) {
                myclb = buildCallback(callback, my.views.length, my.views.length, "ready", "generate_site");
            }

            if (v.type == "copy") {
                my.fileops.copy(Path.join("src", v.path), Path.join(my.settings.output.dir, v.uri))
                    .then(() => { if (myclb) { myclb() } })
                    .catch(err => console.error(err));
            } else {
                //let c = my.template.render(v);
                let c = my.renderOneFile(v , {editmode: false});
                c = rp.rewriteAllLinks(c, v.uri);
                my.fileops.write(Path.join(my.settings.output.dir, v.uri), c)
                    .then(() => { if (myclb) {  myclb() } })
                    .catch(err => console.error("Can not write (in generateAll)", v.uri, err));
            }
            

        });
        //
    }
    /*
    
              //////////////////\
            ///ADDING FILES///  /
          //////////////////  /
          \\\\\\\\\\\\\\\\\\/
    
     */




    //write file (for edited src files)
    //view => Promise? => void
    this.save = async function (view) {
        //console.log("Saving" , view)
        //this is edited file   
        //do we have it?
        let mindx = this.lister.getIndexByField("uri", view.uri);
        //replace the view with the given one
        if (mindx !== null) {
            my.views[mindx] = view;
        } else {
            //or add if new
            console.log("Production: save: new view", view)
            //view.virtual = true; //have to save to keep!
            my.views.push(view);

        }
        my.updateList();
        my.generateVirtuals();
        //save the view to source
        //console.log(this.lister.getByField("uri", view.uri));
        if (view.type == 'src') {
            return this.fileops.write(Path.join("src/", view.path), Formats.encodeFile(view));
        } else {
            console.error("Procuction: Wrong function usage or invalid view at", view.path);
        }
    }

    //arrayBuffer , string => Promise

    this.addFile = function (p, arb) {
        //this is edited file   
        //find the view in my collection
        console.log("Production: Saving", p);
        ///my.fileops.write(Path.join("src", p) , arb);

        let whr = new Promise(function (res, rej) {
            //console.log("inside Promise");
            //console.log("Will write", Path.join("src", p))
            my.fileops.write(Path.join("src", p), arb)
                .then(function () {
                    console.log("Production: about to add view")
                    Formats.decodeFileFromPath(p, async x => null)
                        .then(function (v) {
                            my.views.push(v);
                            my.generateVirtuals();
                            res();
                        }
                        );
                })
                .catch(err => { console.error("File adding error", err); rej() })
                ;
        });
        //console.log(whr);
        return whr;
    }


    ////////////
    ///SERVICE///
    ////////////

    ///find free path :( ?
    this.findFreePath = function (p) {
        let fp = this.lister.findFreePath(p);
        return fp;
    }



    //Loading settings
    //creating template loader?
    //
    this.init = async function (readycallback) {
        //console.log(my.fileops.base);
        //console.log(Path.join( my.fileops.base , "_config/settings.json"));

        //settings file

        let config = fileops.get("_config/settings.json");
        //load custom scripts

        config
            .then(function (r) {
                //parse settings
                my.settings = JSON.parse(my.decoder.decode(r));
                return my.settings;

            })
            .then(async function(settings){
                //new template routines
                //do there a basic calcs
                //new context on each run
                //
                //result: f(template name) => f(context) => html
                //console.log("reader" , my.fileops.getSync)
                my.FTemplate = Template
                .FTemplate(my.fileops.getSync)
                (Themes.templatePath(settings))                
                ;

                })
            .then(this.loadCustomScripts())
            .then(()=>readycallback(my.settings)) //readycallback
            .catch(err => console.error("Can not load settings:" , err))
    }
}

