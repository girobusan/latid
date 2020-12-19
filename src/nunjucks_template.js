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

export function nbsp(str){
    let words = str.split(/\s|&nbsp;/g);
    const shortword = /^\(?\"?«?[a-zА-Яа-я0-9]{1,2}\.?$/gi;
    const skip = /^<.+>$/g;
    const tag = /<[^>]+>|^[^>]+>|<[^>]+$/g;
    const addbefore = /^—|–|-|&mdash;$/g;
    let in_tag = false;
    let testShort = function(w){
        let s = w.replace(tag, "");
        //console.log("S" , w, s , s.match(shortword)!==null);
        return s.match(shortword) !== null;
    }
    let spaces = words.map(function (e, i, a) { //return NEXT space symbol
        //chek if we're get the tag:
        if (e.match(skip)) { //it is a htm
            return " ";
        }
        //check if we're entering tag
        let opens = e.split("<").length - 1;
        let closes = e.split(">").length - 1;

        if (opens - closes == 1 && !in_tag) {
            in_tag = true;
        }
        //check if we're exiting tag
        if (closes - opens == 1 && in_tag) {
            in_tag = false;
        }
        if (in_tag) { //inside tag, next space is just space
            return " " 
        }
        //fix before?
        if (i + 1 < a.length && a[i + 1].match(addbefore)) {
            return "&nbsp;" //before smth 
        }
        //last token
        if (i + 1 == a.length) {
            return "";
        }
        //chek if there is a case for nbsp
        if (testShort(e)) {
            return "&nbsp;"
        }
        //default: space
        return " ";
    });
    //insert spaces between symbols
    // add space to each symbol
    let r = words.map((e, i) => e + spaces[i]).join("");
    //console.log("return" , r)
    return r; 
};



export function rewriteLinks(htx, uri, views , settings) {
    var rp = new Rewriter.rewriter(views,settings);
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
    
    var my = this;
    my.nunjucks = new nunjucks.Environment(loader, { autoescape: false });
    my.nunjucks.addFilter('nbsp' , nbsp);

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
            "build_date": (new Date()).toISOString(),
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
