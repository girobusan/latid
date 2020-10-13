
//import * as pathops from "./pathops" ;



export function lister(viewslist) { //arg = list of views
    var my = this;
    this.views = viewslist;
    
    //function listDirectSiblings(p, plist, what) { //what = "dirs" | "pages" | "all"   // p = /path/to/index.json
 
    /**
     * @param {string} fieldname Name of field
     * @param {fieldvalue}
     */

    this.listChildren = function(p){
        
    }

    this.getIndexByField = function (fieldname, fieldvalue) {
        
        //smart version
        const view_fileds = ["uri", "path"]; //that fields are used in views only
        //do we looking for field in view?
        var lookinview = view_fileds.indexOf(fieldname) != -1;

        //console.log("start looking for", fieldvalue, "in", fieldname , "inside" , my.views);
        var ri = null;
        my.views.forEach(function (e , i) {
            //console.log(e);
            //we need to lookup by view fields
            if (lookinview && fieldname in e && (e[fieldname] == fieldvalue)) {
                ri = i;
            }
            //we need to lookup in file fields
            if (!lookinview && "file" in e && "meta" in e.file && fieldname in e.file.meta  && (e.file.meta[fieldname] == fieldvalue)) {
                ri = i;
            }
        });
        //console.log("lister will retrn", r)
        return ri;

    }//getByField



    
    this.getByField = function (fieldname, fieldvalue) {
        //smart version
        return my.views[my.getIndexByField(fieldname , fieldvalue)] || null;

    }//getByField



    this.unpackURI = function (anypath) {
        if (anypath.startsWith("/")) {
            if (anypath.startsWith("/+")) {
                var parts = anypath.substring(2).trim().split(/\s*:\s*/);
                if (parts.length != 2) {
                    console.log("invalid link:", anypath);
                    return anypath;
                }
                //console.log("LOOKUP" , )
                var lookup = this.getByField(parts[0], parts[1])
                if (lookup) {
                    return lookup.uri;
                } else {
                    return anypath
                }
            }else{
                return anypath;
            }
        } else {
            return anypath;
        }
    }//8 800 250-04-05



    this.resolveAnyPath2URI = function (anypath) {
        if (anypath.startsWith("/")) {
            if (anypath.startsWith("/+")) {
                var parts = anypath.substring(2).trim().split(/\s*:\s*/);
                if (parts.length != 2) {
                    console.log("invalid link:", anypath);
                    return anypath;
                }
                var lookup = this.getByField(parts[0], parts[1])
                if (lookup) {
                    return lookup.uri;
                } else {
                    return anypath
                }
            }else{
                return anypath;
            }
        } else {
            return anypath;
        }
    }//resolve any path (?)

    this.findFreePath = function(path) {
        //
        //console.log(my.views)
        //look up in latid.views!!!!
        var rp = path;
        var stem = rp.replace(/\.[a-zA-Z0-9]+$/, "");
        var ext = rp.substring(stem.length);
    
        //var mylister = new lister(R4);
        var iter = 1;
        var newstem = stem;
        console.log("Let me test for free path" , ("path", newstem + ext));
        console.log("I have?" , this.getByField("path", newstem + ext))

    
        while ( (this.getByField("path", newstem + ext) != null) || iter>1999) {
            newstem = stem + "_" + iter;
            iter += 1;
        }
        return newstem + ext;
    
    }
}
//export funciton
/*
export function findFreePath(R4, path) {
    //
    //look up in latid.views!!!!
    var rp = path;
    var stem = rp.replace(/\.[a-zA-Z0-9]+$/, "");
    var ext = rp.substring(stem.length);

    var mylister = new lister(R4.views);
    var iter = 1;
    var newstem = stem;

    while (mylister.getByField("path", newstem + ext) != null) {
        newstem = stem + "_" + iter;
        iter += 1;
    }
    return newstem + ext;

}
*/