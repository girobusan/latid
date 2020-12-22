/*
Source file formats
*/
const matter = require('gray-matter');
import * as Views from "./views";

function prepFields(frjson , additional_file_info , force){
//console.log("PF" , frjson , additional_file_info , force);
  //do we have a date?
  if(!"date" in frjson.meta){
    frjson.date = additional_file_info.mtime;
    console.info("Fix date at" , additional_file_info.path );
  }
  //
  if(!("title" in frjson.meta) 
    && force 
  && frjson.content_format==='markdown'){
    let first_lb = frjson.content.indexOf("\n");
    if(first_lb==-1){
      return frjson;
    }
    let ttl = frjson.substring(0, first_lb)
    .replace(/^\s*#+\s*/ , "")
    .trim();

    if(ttl.length>250){
      ttl = ttl.substring(0,250)
    }
    frjson.meta.title = ttl;
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
      //console.log("VALID")
      return tp;
    } else {
      return false;
    }

  } catch{
    return false;
  }
}

function decodeMd(mdt) {
  //console.log("MARKDOWN")
  try {
    let mds = matter(mdt, { excerpt: true, excerpt_separator: '<!--cut-->' });
    //console.log("MD:" , mds);
    if ("data" in mds && "title" in mds.data) {
      let fdata = {
        "meta": mds.data,
        "content": mds.content,
        "content_format": "markdown"
      }

      fdata.meta.excerpt = mds.excerpt || fdata.meta.excerpt;

      return fdata;
    } else {
      //console.log("data" in mds  , "title" in mds.data , "date" in mds.data)
      return null
    }

  } catch (e) {
    console.log("Really invalid", e)
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
        parsed_file = decodeMd(txt);

      }
      //console.log(djs,txt)
      if (parsed_file) {
        //console.log("Resolvin JSON src")
        res(
          Views.makeSrcView(
            path,
            "/" + path.replace(/\.[a-zA-Z]+$/ , ".html"),
            prepFields(parsed_file , additional_file_info , false)
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
      let s = ks[k] + ": " + view.file.meta[ks[k]] + "\n";
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

