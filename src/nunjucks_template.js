var nunjucks = require('nunjucks');//   /_config/templates/template.nunjucks
import * as Listops from "./listops";
import * as CRender from "./content_render";
import * as Pathops from "./pathops";
import * as Util from "./util";
import * as Rewriter from "./link_replacer";
//import {TextDecoder as _TD} from "util";


var TD =null ;//|| require('util').TextDecoder ;

if(typeof TextDecoder !== 'undefined'){
    //console.log("Clobal TextDecoder used.")
    TD = TextDecoder;
}else{
    TD = require("util").TextDecoder ;
}

const path = require("path");
const dec = new TD("utf-8");



export function rewriteLinks(htx, uri, views) {
    var rp = new Rewriter.rewriter(views);
    return rp.rewriteAllLinks(htx, uri);
}

export function buildLoader(rdr) {
    //console.log("Building template loader with", rdr)
    let l = function () { }
    l.getSource = function (name) {
        //console.log("my get source")
        const basename = '/_config/templates/';
        //console.log("reading NJK")
        return {
            src: rdr(Util.gluePath(basename, name)),
            path: name
        }
    }


    //console.log(Object.keys(l.prototype), l.getSource());
    return l;
}

var workerLoader = nunjucks.Loader.extend(
    {
        //async: true,
        "getSource": function (name, callback) {
            const basename = '/_config/templates/';
            //let source = null;
            var request = new XMLHttpRequest();
            request.open('GET', basename + name, false);
            request.send(null);
            if (request.status == 200) {
                return {
                    src: request.responseText,
                    path: name
                }
            } else {
                console.log("request status ", request.status)
                return null;
            }
        }
    });



export var serverLoader = buildLoader(function (name) {
    let r = l4.server.getSync(path.join('/_config/templates/', name));
    return dec.decode(r.details);
}
);
/**
 * 
 * @param {Array} viewlist 
 * @param {Object} settings 
 * @param {Object} meta 
 * @param {Object} loader 
 */

export function template(viewlist, settings, meta, loader) {
    //console.log("NUNJUCKI", meta)
    if (!loader) {
        //console.log("no loader");
        loader = new workerLoader('/_config/templates');
    } else {
        //console.log("custom loader", loader);
    }
    this.views = viewlist;
    this.settings = settings;
    //console.log("LISTERRR");
    
    //console.log("SET", this.liseter.getBy);
    //console.dir(loader);
    //this.rewriter =  Rewriter.rewriter(this.views);
    //console.log()
    var my = this;
    my.nunjucks = new nunjucks.Environment(loader, { autoescape: false });
    my.lister = new Listops.lister(viewlist);
    //console.log("test lister" , this.lister.getByField("uri" , "/tags/index.html" ));
    //console.log("ABOUT TO DEFINE RENDER")
    this.render = function (view) {
        //console.log("NJK render" , view.uri);
        //create context
        let context = {
            "editmode": typeof window == 'undefined' ? false : true,
            "list": my.lister,
            "paths": Pathops,
            "settings": my.settings,
            "view": view,
            "content": CRender.renderThis(view , my.settings),//render content using CR
            "util": Util,
            "log": () => console.info.apply( this , ["Nunjucks:"].concat(arguments)),//console.log("NJK:" , t),
            "views": viewlist,
            "meta": meta
        }
        //console.dir(context);
        let r = my.nunjucks.render("index.njk", context);
        //console.log("Result" , r)
        //console.log(CRender.renderThis(view));

        //render
        //return string
        return r;

    }

    this.populate = function (view) {
        return my.render(view);
    }

}
