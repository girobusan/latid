/*
Source file formats
*/
const util = require("./util");
const matter = require('gray-matter');
const mdit = require('markdown-it-multimd-table'); 
import * as Views from "./views";
//????
var md = require('markdown-it')({html:true})
.use(mdit , {multiline: true , rowspan: true , headerless: true});

function prepFields(frjson , additional_file_info , default_date ){
  //console.log("PF" ,  additional_file_info );
  //fix date field
  if(!("date" in frjson.meta)){
    frjson.meta.date = default_date ? default_date :  "1970.1.2 10:10"; //:FIX!
    //console.info("Fix date at" , additional_file_info , "to" , frjson.date );
  }
  //fix excerpt in markdown
  if(frjson.content_format==='markdown'){
    if(frjson.meta.excerpt){
    frjson.meta.excerpt = md.render(frjson.meta.excerpt).replace("\n" , " ");
    }
    //fix title field in markdown
    if(!("title" in frjson.meta) 
    && frjson.content_format==='markdown'){
      let first_lb = frjson.content.trim().indexOf("\n");
      if(first_lb==-1){
        //return frjson;
        first_lb = 100;
      }
      let ttl = frjson.content.trim().substring(0, first_lb)
      .replace(/^\s*#+\s*/ , "")
      .trim();
      if(ttl.length>250){
        ttl = ttl.substring(0,250)
      }
      frjson.meta.title = ttl;
    }
  }
  return frjson;
}

/*
Must return Promise, which resolves to Copy view OR File view
getter - gets file content as TEXT
* */


function decodeJSON(jsnt) {
  try {
    //console.log(jsnt);
    let tp = JSON.parse(jsnt);
    //console.log(tp)
    if ("meta" in tp && "content" in tp ) {
      //console.log("VALID JSON")
      return tp;
    } else {
      return false;
    }

  } catch{
    return false;
  }
}


function decodeMd(mdt , force) {
  //console.log("MARKDOWN" , force)
  try {
    let fdata = {"content_format": "markdown"}
    let mds = matter(mdt, { excerpt: true, excerpt_separator: '<!--cut-->' });
    //console.log("MD:" , mds);
    if ("data" in mds && "title" in mds.data) {
      //console.log("data and title" , mds.data);
      fdata.meta =  mds.data;
      fdata.content = mds.content.trim();
      fdata.meta.excerpt = mds.excerpt || fdata.meta.excerpt;
    } else if ( ("data" in mds) && force){
    //console.log("data only");
      fdata.meta =  mds.data;
      fdata.content = mds.content.trim();
      fdata.meta.excerpt = mds.excerpt || fdata.meta.excerpt;
    } else if(force){
    //console.log("force only");
      fdata.meta = {};
      fdata.content = mdt.trim();
    } else {
      //console.log("Markdown to copy" , mdt);
      return null
    }
    return fdata;

  } catch (e) {
    console.error("Probably, invalid markdown:", e)
    return null;
  }
}



export async function decodeFileFromPath(path, text_getter , additional_file_info , settings) {
  ////  console.log("decode", additional_file_info)
  //==If it's definetly not source file, return Copy
  if (!path.match(/\.(json|md|markdown)$/gi)) {
    return new Promise(function (res, rej) { res(Views.makeCopyView(path)) });
  }
  //==Get file content
  let txt = await text_getter(path);
  //console.log("DECODING")
  return new Promise(
    function (res, rej) {
      //console.log("GOT" , path , '"' + txt + '"')
      var parsed_file;
      if (path.match(/\.json$/gi)) {
        //console.log("THis is JSON" , path)
        parsed_file = decodeJSON(txt);
      } else {
        //markdown
        //console.log("This is MARKDOWN" , txt)
        parsed_file = decodeMd(txt , settings.markdown.force_source );

      }
      //console.log(djs,txt)
      if (parsed_file) {
        //console.log("Resolvin JSON src")
        res(
          Views.makeSrcView(
            path,
            "/" + path.replace(/\.[a-zA-Z]+$/ , ".html"),
            prepFields(parsed_file , additional_file_info , settings.output.default_date )
            ));
      } else {
        //console.log("resolving COPY")
        res(Views.makeCopyView(path));
      }

    });
}


//view => text
export function encodeFile(view) {
  if (view.path.endsWith(".json")) {
    return JSON.stringify(view.file, null, 2);
  }
  if (view.path.match(/\.(md|markdown)$/i)) {
    let md = "---\n";
    let ex = view.file.meta.excerpt || "";
    let ks = Object.keys(view.file.meta).filter(k => k != "excerpt");
    //meta
    for (let k in ks) {
      let s = ks[k] + ": " + view.file.meta[ks[k]].replace("\n" , " ") + "\n";
      md += s;
    }
    if (ex) { md += "excerpt: " + ex.trim("\n").replace("\n", "\\") + "\n" }
    md += "---\n";
    //add excerpt
    //
    md += view.file.content;
    return md;
  }else{
    console.error("This file can not be encoded as source:" , view.path)

  }
}

