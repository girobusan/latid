import * as Util from "util";
/**
 * Is p2 a direct child of p1?
 * @param {*} p1 
 * @param {*} p2 
 */

export function isDirectChild(p1, p2) { //p1 = wannabe parent
    //console.log("WE HAVE" , p1 , p2)
    if (!isIndex(p1)) {
        return false; //no children for regular pages
    }
    let p2p = isIndex(p2) ? getDir(getDir(p2)) : getDir(p2);
    let p1p = getDir(p1);
    //console.log("INTERMIDIATE",  p1p , p2p)
    //console.log("ARE P2 A CHILD?" , p2p == p1p);
    return p2p == p1p;
}

/**
 * Splits path. Do not use it.
 * @param {*} p 
 */
export function splitPath(p) {
    let pa = p.split("/");
    return pa.filter(e => e);
}
/**
 * Join array of path parts to path
 * @param {*} partsarray 
 * @param {*} add_leading_slash 
 */
export function joinPath(partsarray, add_leading_slash) {
    let pj = partsarray.join("/");
    return add_leading_slash ? "/" + pj : pj;
}

/**
 * Count parts of path
 * @param {*} p 
 */
export function countPathParts(p) {
    return splitPath(p).length;
}

export function pathEqualParts(p1, p2) {
    let p1a = splitPath(p1);
    let p2a = splitPath(p2);
    let common = [];
    p1a.forEach(function (pp, i) {
        if (pp == p2a[i]) {
            common.push(pp)
        }
    });
}


export function getIndexPathStem(p) { //index of current path , if it's already index - it
    var dir = getDir(p)
    return Util.gluePath(dir, "index"); //??
}

export function isIndex(p) {
    //console.log(p);
    if (p.match(/(^|\/)index(_\d+)?(\.[a-zA_Z]*)?$/gi) != null) {
        return true;
    } else {
        return false;
    }
}

export function isSameLevel(p1, p2) {
    //console.log("is", p1, "on the same level with", p2, getIndexPathStem(p1) == getIndexPathStem(p2));
    let mbe1 = isIndex(p1) ? getDir(getDir(p1)) : getDir(p1);
    let mbe2 = isIndex(p2) ? getDir(getDir(p2)) : getDir(p2);
    return mbe1 == mbe2;
}

/**
 * Removes last element of any path
 * @param {p} string 
 */
export function getDir(p) { //regardless index it or not  //top level ==""
    //console.log(p);
    var ls = p.lastIndexOf("/");

    if (ls == -1 || ls == 0) {
        //console.log( p , "top!");
        return "";
    } else {
        return p.substring(0, ls);
    }
}

/**
 * Lists top level pages and dirs from given views list
 * @param {Array} thelist  - list of all views
 * @param {String} what - all | pages | dirs
 * @param {Function} accessor 
 * 
 */

export function listTopLevel(thelist, what, accessor) {
    if (!accessor) {
        accessor = e => e.path;
    }
    if (!what) {
        what = "all";
    }
    let plist = thelist.filter(e => !e.nolist && (e.type == "src"));
    

    var res = [];

    if (what == "pages" || what == "all") {
        res = res.concat(plist.filter(e => !isIndex(accessor(e))).filter(e => countPathParts(accessor(e)) == 1));
    
    }
    if (what == "dirs" || what == "all") {
        res = res.concat(
            plist.filter(e => isIndex(accessor(e)) &&  (countPathParts(accessor(e)) <= 2))
            );
    }
    return res;
}

/**
 * Which path is one level up from the given one
 * @param {String} p 
 */

export function upOne(p) { //retun index
    //console.log("UP FROM" , p)
    var trailing = p.startsWith("/") ? "/" : "";
    var ext = p.substring(p.lastIndexOf("."));
    if (p.replace(/^\//, "").startsWith("index.")) {
        //console.log("Nothing")
        return null;
    }
    if (isIndex(p)) {
        let r = getDir(getDir(p)) == "" ? trailing + "index" + ext :  trailing + getDir(getDir(p)) + "/index" + ext;
        //console.log(r)
        return r
    } else {
        let r = getDir(p) == "" ? "index" + ext : getDir(p) + "/index" + ext;
        //console.log(r);
        return r
    }
}

export function getFileName(p) {
    return p.substring(getDir(p).length);
}

export function filterByType(plist, what) {
    var r = plist.filter(e => !e.nolist && e.type == "src");
    if (what == "all") {
        return r
    }
    if (what == "pages") {
        return r.filter(e => !isIndex(e.uri));
    }
    if (what == "dirs") {
        return r.filter(e => isIndex(e.uri));
    }
}


export function listAllUnder(p, plist, pfield, what) {

    if (!what) {
        what == "all"
    };
    if (!pfield) {
        pfield = "uri"
    };
    var sp = getDir(p[pfield]); // isIndex(p[pfield]) ? getDir(p[pfield]) : getDir(p[pfield]);
    var pr = plist.filter(e => e[pfield].startsWith(sp))
    return filterByType(pr, what);

}
/**
 * List direct children of path from given list
 * @param {String} p - path
 * @param {Array} plist - views list
 * @param {String} what - all|pages|dirs
 * @param {Function} accessor  - acessor function, view => path|uri
 */
export function listDirectChildren(p , plist , what , accessor){
    if (!accessor) {
        accessor = function (e) {
            return e.uri;
        }
    };
    let mlist = plist.filter(e=> !e.nolist);
    let res = [];
    if( what=="dirs" || what == "all"){
        res = res.concat(mlist.filter( e=> isIndex(accessor(e)) && isDirectChild(p , accessor(e))  ));
        //console.log("ONE" , res)
    }
    if(what == "pages" || what =='all'){
        res = res.concat(mlist.filter( e=> !isIndex(accessor(e)) && isDirectChild(p , accessor(e))  ));
        //console.log("TWO" , res)

    }
    return res;

}

export function listDirectSiblings(p, plist, what, accessor) { //what = "dirs" | "pages" | "all"   // p = /path/to/index.json

    if (!accessor) {
        accessor = function (e) {
            return e.path
        }
    };
    //console.log("GET DIR", getDir(p));

    if (isIndex(p) && (!getDir(p))) {
        return listTopLevel(plist, what, accessor)
            .filter(e => accessor(e) != p);
    }
    //
    var rarr = [];

    if (what == "pages" || what == "all") {
        //getDir == getDir
        var psl = plist.filter(function (e) {
            return getDir(accessor(e)) == getDir(p) && !e.nolist
        });
        rarr = rarr.concat(psl);
        //console.log("FILE SIBLINGS" , p , psl , rarr);
    }

    if (what == "dirs" || what == "all") {
        //getDir == getDir
        //testing P 
        rarr = rarr.concat(plist.filter(function (e) {
            return isIndex(accessor(e)) && getDir(getDir(accessor(e))) == getDir(p) && !e.nolist
        }));
    }

    return rarr;

} //end list direct siblings