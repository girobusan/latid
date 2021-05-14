var nunjucks = require('nunjucks');//   /_config/templates/template.nunjucks
import * as Pathops from "./pathops";
import * as Util from "./util";
import * as Rewriter from "./link_replacer";


  // var TD =null ;//|| require('util').TextDecoder ;
  // 
  // if(typeof TextDecoder !== 'undefined'){
  //     //console.log("Clobal TextDecoder used.")
  //     TD = TextDecoder;
  // }else{
  //     TD = require("util").TextDecoder ;
  // }

//const path = require("path");
//
//template addons
//
export function metasort(views_array, field_name , reverse , as_number){
  return msort(views_array , reverse, field_name  , as_number);
}

export function msort(views_array , reverse, field_name  , as_number){
  let r = views_array.slice(0);
  r.sort(function(a,b){
    let av , bv;
    if( a.file.meta[field_name] ){
      av = as_number ? parseFloat(a.file.meta[field_name]) : a.file.meta[field_name].toString();
    }else{
      av = null;
    }

    if( b.file.meta[field_name] ){
      bv = as_number ? parseFloat(b.file.meta[field_name]) : b.file.meta[field_name].toString();
    }else{
      bv=null;
    }
    if(av && !bv){
      return 1;
    }
    if(!av &&bv){
      return -1
    }
    if (av>bv){
      return 1;

    }else if(av<bv){
      return -1

    }else{
      return 0;
    }


  })
  if(reverse){r.reverse()};
  return r;
}

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

//link rewriter

// export function rewriteLinks(htx, uri, views , settings) {
//   
//     var rp = new Rewriter.rewriter(views,settings);
//     return rp.rewriteAllLinks(htx, uri);
// }


export function FbuildLoader(reader , pathfinder) {
  //console.log("Incoming reader" , reader)

    return {
      "getSource" : function (name) {
        return {
          src: reader(pathfinder(name)) || "",
          path: name

        }}}

    }


/*
 *
 * Main template function
 *
 * f(file loader) => f(pathifinder_func) => f(tpl_name) => f(context) -> html
 *
 */


//f(file loader) => f(pathifinder func)
    export function FTemplate(floader){
      var common_context = {
        "util": Util,
        "paths" : Pathops,
        "log": () => console.info.apply( this , ["Template:"].concat(arguments)),//console.log("NJK:" , t),
      }

      // f(pathifinder func) => f(tpl_name)
      return function(pfinder){
        //here we can setup nunjucks engine
        let Tloader = FbuildLoader(floader , pfinder) ; //not right
        //
        //nt stands for Nunjucks Template
        var nt = new nunjucks.Environment(Tloader, { autoescape: false });
        nt.addFilter('nbsp' , nbsp);
        nt.addFilter('msort' , msort); 

        // f(tpl_name) => f(context)
        return function(tpl_name){

          //f(context) => html
          return function(context){
            //composing context 
            let local_context = Object.assign({} , common_context , context);
            //add current fields to context
            local_context.build_date = (new Date()).toISOString();

            try{
              //console.log("NT" , nt)
              return nt.render(tpl_name , local_context);
            }catch(err){
            // In most cases, it means that there is no template
            // which is normal for blocks 
            // we must return empty string 
              console.info("No custom template:" , pfinder(tpl_name ));
              return ""
            }
          }
        }     
      }
    }
