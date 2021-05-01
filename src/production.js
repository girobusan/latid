/*

 Platform-independent 
 recipes for system  operations
 (requires save/load routines on init)
 
*/

import * as Views from "./views";
import * as Formats from "./formats";
import * as Listops from "./listops";
import * as Template from "./nunjucks_template"; //loader?
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

    this.getBase = function (pt) {
        return Path.join(this.fileops.base, Path.dirname(pt)) + "/";
    }
    ////////////////
    /// LOADING  ///
    ///////////////

    //one file processing
    //returns ptromise
    this.path2view = function (finfo, callback  ) {
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
                            my.updateList();                            
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
    this.getHTMLSync = function (val, fld, add_local_base_tag) {
        //var my = this;
        this.generateVirtuals();
        //this.updateList()
        if (add_local_base_tag) {
            my.meta.preview = true;
        }
        my.template = new Template.template(my.views, my.settings, my.meta, my.template_loader);

        let rp = new Rewriter.rewriter(this.views, "/src/" , my.settings);

        let bf = fld || "uri";
        let v = this.lister.getByField(bf, val);
        //console.log("Lister got View" , v)
        if (v) {
            let tr = my.template.render(v);
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
                h = h.replace("<head>", "<head><base href='" + lb + "'>");
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
        my.template = new Template.template(my.views, my.settings, my.meta, my.template_loader);
        my.views.forEach(function (v, i, a) {
            var myclb = null;
            if (i % 10 == 0 && i < my.views.length && callback) {
                myclb = buildCallback(callback, i, my.views.length, "working", "generate_site");
            } else if (i == my.views.length - 1 && callback) {
                myclb = buildCallback(callback, my.views.length, my.views.length, "ready", "generate_site");
            }

            if (v.type == "copy") {
                my.fileops.copy(Path.join("src", v.path), Path.join(my.settings.output.dir, v.uri))
                    .then(() => { if (myclb) { myclb() } })
                    .catch(err => console.error(err));
            } else {
                let c = my.template.render(v);
                c = rp.rewriteAllLinks(c, v.uri);
                my.fileops.write(Path.join(my.settings.output.dir, v.uri), c)
                    .then(() => { if (myclb) { myclb() } })
                    .catch(err => console.error("Can not write (in generateAll)", v.uri, err));
            }
            

        });
        //
        //buildCallback(callback, my.views.length, my.views.length, "ready", "generate_site")();
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


    //locate view by field (listops)
    // field name, field value => view obj

    //preparations
    this.init = async function (readycallback) {
        //console.log(my.fileops.base);
        //console.log(Path.join( my.fileops.base , "_config/settings.json"));

        //settings file

        let configs = [fileops.get("_config/settings.json")];

        Promise.all(configs)
            .then(function (r) {
                //parse settings
                my.settings = JSON.parse(my.decoder.decode(r[0]));

                //look for block templates if any
                let tpls = r.slice(1);
                tpls = tpls.map(e => my.decoder.decode(e).toString());
                //
                let tpls_dict = tpls.reduce(function (a,c,i){ a[bt_names[i]] = c ; return a} , {});
                
                my.settings.block_templates = tpls_dict;
                my.template_loader = Template.buildLoader(function (p) {
                //console.log("Template Loader was created on load");
                    let tc = my.fileops.getSync(p); //ArrayBuffer
                    return tc;
                } , my.settings);

                //readycallback();
                return my.settings;

            })
            // immediately load 
            // block templates
            .then(async function(settings){
                //figure out blocks path
//                console.log("BLOCK FINDING");
//                console.log("themes" in settings);
//                console.log(settings.themes.enabled);
//                console.log(settings.themes.theme);
                if("themes" in settings && settings.themes.enabled && settings.themes.theme){
                  var block_path = "_config/themes/" + settings.themes.theme + ".t/blocks/"; 
                }else{
                 console.log("No theme");
                 block_path = "_config/templates/blocks/";
                }
              console.log("Blocks are in", block_path) ;
                let bl = await fileops.list(block_path) ;
                return bl.map(e=> {  e.name = e.path ; e.path =block_path + e.path;  return e})
                //.catch(err=>console.log("No custom block templates", err));
                ;
           })
           // load pack them to settings object
           // it's not the best solutuion
           .then(async function(blist){
             if(!blist){
               return ;
             }
             console.log(blist);
             blist = blist || [];
             //preload block templates 
             let bt_promises = [];
             let bt_names = [];

             //block templates list
             blist.forEach(function (e) {
               console.log("block template" , e.path)
               bt_names.push(e.name.substring(0, e.name.lastIndexOf(".")))
               bt_promises.push(fileops.get(e.path));
             });

             //push them to settings
             Promise.all(bt_promises) //load all srources
             .then(function(r){
               r.forEach(function(e , i){
                 my.settings.block_templates[bt_names[i]] = my.decoder.decode(e).toString();
             //console.log("BLOCKS ADDED" , my.settings)
               })
             });


           }) // block tempaltes loaded
            .then(readycallback) //readycallback
            .catch(err => console.error("Can not load settings:" , err))
    }
}

