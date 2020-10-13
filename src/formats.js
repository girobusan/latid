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

            //fdata.meta.excerpt = mds.excerpt || "";
            //console.log("RETURN" , fdata)
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



export function decodeFileFromPath(path, text_getter) {
    //test first
    //console.log("decode", path)
    //text_getter(path).then(t=>console.log(t));
    if (path.match(/\.(json|md|markdown)$/gi)) {
        //console.log("DECODING")
        return new Promise(
            function (res, rej) {
                text_getter(path)
                    .then(function (txt) {
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
                            //console.log("MDS" , mds);
                            //console.log("MDS IS" , (mds? "truthy" : "falsy"))
                            if (mds) {
                                res(
                                    Views.makeSrcView(
                                        path,
                                        "/" + path.replace(/\.[a-zA_Z]+$/, ".html"),
                                        mds)
                                );

                            } else {
                                //console.error("INVALID MARKDOWN", path);
                                res(Views.makeCopyView(path));
                            }
                        }
                    })
                    .catch(e => { console.error("ERROR", e); rej() });
            });

    } else {
        //console.log("DEFINETELY A COPY");
        return new Promise(function (res, rej) { res(Views.makeCopyView(path)) });
    }
}

//console.log("something went wrong")

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

    }

}

