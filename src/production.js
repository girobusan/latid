

/*

 Platform-independent 
 recipes for system  operations
 (requires save/load routines on init)
 
*/
const TOML = require('@iarna/toml');
var any = require('promise.any');
// const obj = TOML.parse(`[abc]...

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
    this.customScripts = {};
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

    this.callCustomScripts = function(hook, arg , hint){
      const h = hint;
      if(this.customScripts.hasOwnProperty(hook)){
        return this.customScripts[hook].reduce((a,s)=>{          
          a = s(a , h);
          return a;

        } , arg);
      }else{
        return arg;
      }
    }

    this.loadCustomScripts = function(){
    //list _config/scripts
    return this.fileops.list("_config/scripts")
    .then(r=>{
      let l = r.filter(e=>!e.path.startsWith('disabled'));
      //console.log("LIST" , l);
      if(l.length==0){console.info("No custom scripts used.");return}
      console.info("Loading custom scripts");
      l.forEach((f,i)=>{

        let util = Util;
        let fileops = this.fileops;
        let settings = this.settings;
        
        let d = eval(this.fileops.getSync(Path.join("_config/scripts" , f.path)));
        console.info((i+1) + "." , d.title || f.path);
        //console.log(d.hooks);
        d.hooks.forEach( h=>{
          if(h[0] in this.customScripts){
            this.customScripts[h[0]].push(h[1])
          }else{
            this.customScripts[h[0]] = [h[1]]
          }
        })
        //test("???")
        //d("test in place")
      })
    })
     
    .catch(e=>console.info("No custom scripts found:" , e))
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
        let cnt = CRender.FrenderThis(view, my.FTemplate);
        cnt = my.callCustomScripts("one_content" , cnt , view);
      let view_context =  {
        "content" : cnt,//render
        "meta" : my.meta,
        "list" : new Listops.lister(my.views),
        "settings" : my.settings,
        "view" : view,
        //"editmode":  WorkerGlobalScope !== undefined ,
        "views" : my.views,
        "embed" : function(euri , fn){
           //get view 
           const lister = new Listops.lister(my.views);
           let v = lister.getByField(  fn||"uri" , euri);

           //console.log('EMBED' , v , my.views);
           if(v===null){
           console.error("Embed failed:" , euri);
            return " ";
           }

           return CRender.FrenderThis(v, my.FTemplate) ;
           //return "embed";

        }
      
      };
      return context ? Object.assign(view_context , context) : view_context;
    }

    this.renderOneFile = function(view , context){
      //context.editmode = true;
      let htm =   my.FTemplate("index.njk")(my.view2context(view , context));
      htm = this.callCustomScripts("one_html" , htm , view);
      return htm;

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
        // if(!viewsList){viewsList = my.views};
        //remove previous: all virtual pages and all tag pages, virtual or not 
        my.views = my.views.filter(e => !e.virtual);
        //remove all possible virtual references
        my.views.forEach(e => { if (e.tagslist) { e.tagslist = [] } }); //generated lists of tag views
        my.views.forEach(e => { if (e.tagged) { e.tagged = [] } });   //generated tagged lists from non-virtual tag pages
        //create tags
        my.meta.tags = Tags.makeTagsNew(my.views, my.settings);
        //create multipage indices
        //l4.views.forEach(v => Views.makeMultipageIndex(l4, v, l4.views));
        // console.log('My' , my.settings);
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
                            //console.info('All files processed.' , r2)
                            my.callCustomScripts('all_loaded'  ,r2)
                            my.views = my.views.concat(r2);                            
                            my.generateVirtuals();
                            my.callCustomScripts('all_ready'  , my.views)
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
          //internal html
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
            let rh = my.callCustomScripts("one_html" , h , v);
            return rh;
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

    //    //callback => void
    /**
     * this.generateAll. - 
     * Generate site from current views set
     *
     * @param {Function} callback - Callback, called multiply with completion status
     * @param {Object} opts - Generation options (to be merged with settings)
     */
    this.generateAll = function (callback , opts) {
        my.meta.preview = false;
        if(opts){
          var generation_settings = Object.assign({}, my.settings);
          //  TODO: deep join them
          //  https://www.npmjs.com/package/lodash.merge ?
          generation_settings.output.date_aware_generation = opts.output.date_aware_generation;
        }else{
          generation_settings = my.settings;
        }
        //settings.output.date_aware_generation
        if(generation_settings.output.date_aware_generation){
          //stach current views
          var full_views = my.views;
          //filter by date
          let current_date = new Date();
          if(my.settings.output&&my.settings.output.time_diff){
            var tdiff = my.settings.output.time_diff * 1000 * 60 * 60 ; 
          }else{
            tdiff = 0
          }
          my.views = my.views.filter( v=>{
            if(v.file===undefined 
            || v.file.meta===undefined 
            || v.file.meta.date===undefined)
            {return true}
            let vdate = Util.str2date(v.file.meta.date);
            //if date is invalid, keep file in list 
            let cstatus =  vdate ? current_date.getTime() > (vdate.getTime() + tdiff): true;
            //console.log(v.path , current_date , vdate , cstatus);
            if(!cstatus){
              console.info("~ Future date:", v.file.meta.date , "at" , v.path);
            }
            return cstatus;
          } )
          my.updateList();
           
        }else{
           full_views = null;
        }
        this.generateVirtuals();
        //generate rss
        let rssc = RSS.buildRSS(generation_settings, my.views);
        let rsspath = Path.join(generation_settings.output.dir, generation_settings.rss.uri);
        my.fileops.write(rsspath, rssc)
            .catch(err => console.error("Can not write RSS", err));
        //this.updateList();
        console.info("Preparing to generate", my.views.length, "files")
        //console.log(my.views.map(e=>({"path" : e.path , "uri" : e.uri})))
        let rp = new Rewriter.rewriter(my.views ,false, generation_settings);
        //my.template = new Template.template(my.views, my.settings, my.meta, my.template_loader);
        my.views.forEach(function (v, i, a) {
          my.callCustomScripts("one_saving" , v);
          var myclb = null;
          if (i % 10 == 0 && i < my.views.length && callback) {
            //console.log("CALLBACK");
            myclb = buildCallback(callback, i, my.views.length, "working", "generate_site");
          } else if (i == my.views.length - 1 && callback) {
            //all files ready
            let myclb_0 = buildCallback(callback, my.views.length, my.views.length, "ready", "generate_site");

            myclb  = function(){
              myclb_0();
              if(full_views!=null){
                my.views = full_views;
                my.updateList();
              }
            }
            my.callCustomScripts("all_saved" , my.views);
          }

          if (v.type == "copy") {
            my.fileops.copy(Path.join("src", v.path), Path.join(generation_settings.output.dir, v.uri))
            .then(() => { if (myclb) { myclb() } })
              .catch(err => console.error(err));
          } else {
            //let c = my.template.render(v);
            let c = my.renderOneFile(v , {editmode: false});
            c = rp.rewriteAllLinks(c, v.uri);
            my.fileops.write(Path.join(generation_settings.output.dir, v.uri), c)
            .then(() => {
              if (myclb) {  myclb() };
            })
            .catch(err => console.error("Can not write (in generateAll)", v.uri, err));
          }


        });//
        //
    }// /generateAll
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
        let config_toml = fileops.get("_config/settings.toml")
        .then(r=>TOML.parse(my.decoder.decode(r))) ;
        // let config_fake = fileops.get("_config/settings.fake") ;
        let config = fileops.get("_config/settings.json")
        .then(r=>JSON.parse(my.decoder.decode(r)));

        let composed = any([config_toml,config]) ;

        composed
            .then(function (r) {
                // console.log("We've got settings" , r);
                //parse settings
                my.settings = r; //JSON.parse(my.decoder.decode(r));
                // console.log(my.settings);
                return my.settings;

            })
            .then(async function(settings){
                //new template routines
                //do a basic calcs
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

