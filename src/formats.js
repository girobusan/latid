/*
Source file formats
*/
const matter = require('gray-matter');
import * as Views from "./views";


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
        if ("data" in mds && "title" in mds.data && "date" in mds.data) {
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



export async function decodeFileFromPath(path, text_getter) {
  //console.log("decode", path)
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
        if (path.match(/\.json$/gi)) {
          //console.log("THis is JSON" , path)
          let djs = decodeJSON(txt);
          //console.log(djs,txt)
          if (djs) {
            //console.log("Resolvin JSON src")
            res(
              Views.makeSrcView(
                path,
                "/" + path.replace(".json", ".html"),
              djs))
          } else {
            //console.log("resolving COPY")
            res(Views.makeCopyView(path));
          }

        } else {
          //markdown
          //console.log("This is MARKDOWN" , txt)
          let mds = decodeMd(txt);
          if (mds) {
            res(
              Views.makeSrcView(
                path,
                "/" + path.replace(/\.[a-zA_Z]+$/, ".html"),
              mds)
            );

          } else {
            res(Views.makeCopyView(path));
          }
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

