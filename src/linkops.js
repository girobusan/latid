const d3 = Object.assign({},
    require("d3-selection"),
    //require("d3-event")
)
    ;
import * as  Pathops from "./pathops.js";

export function getRelativeURI(from, to) {
    if(from=="/tags/index.html"){
    //console.log("CALLED FROM IDX", from, to)
    }
    if (from == to) {
        return to.trim("/").split("/").pop() ; 
    }

    var pp1 = from.trim("/").split("/").slice(1);
    var pp2 = to.trim("/").split("/").slice(1);
    //console.log("PP1", pp1, "PP2", pp2)

    var indx = 0;
    var common_path_length = 0;

    while (pp1[indx] == pp2[indx]) {
        common_path_length += 1;
        indx += 1;
    }

    pp1 = common_path_length != 0 ? pp1.slice(common_path_length - 1) : pp1;
    pp2 = common_path_length != 0 ? pp2.slice(common_path_length - 1) : pp2;

   // console.log("RECALC", from, to);

    if (pp1.length > 1) {
        var upto = new Array(pp1.length - 1).fill("..");
        //console.log("RESULT", upto.concat(pp2).join("/"));
        return upto.concat(pp2).join("/")
    } else {
        //console.log("RESULT2", pp2.join("/"));
        return pp2.join("/");
    }
    //console.log("UPTO", upto)
}

//from eriwen/relativePath.js
/**
 * Given a source directory and a target filename, return the relative
 * file path from source to target.
 * @param source {String} directory path to start from for traversal
 * @param target {String} directory path and filename to seek from source
 * @return Relative path (e.g. "../../style.css") as {String} */

export function getRelativePath(source, target) {
    var sep = (source.indexOf("/") !== -1) ? "/" : "\\",
        targetArr = target.split(sep),
        sourceArr = source.split(sep),
        filename = targetArr.pop(),
        targetPath = targetArr.join(sep),
        relativePath = "";

    while (targetPath.indexOf(sourceArr.join(sep)) === -1) {
        sourceArr.pop();
        relativePath += ".." + sep;
    }

    var relPathArr = targetArr.slice(sourceArr.length);
    relPathArr.length && (relativePath += relPathArr.join(sep) + sep);

    return relativePath + filename;
}
/**
 * 
 * @param {Object} R4 
 * @param {String} themode: static |  preview | absolute
 */
export function linkRewriter(R4, themode) { //mode: static |  preview | absolute
    //R4.log("REWRITRRRR");
    var my = this;
    var mode = themode;
    /**
     * 
     * @param {String} Path to rewrite 
     * @param {String} URI of page
     */
    function _makeRightPath(p, uri) {
        if (mode == "static") {
            return getRelativePath(Patops.upOne(uri), p);
        }
        //preview = add src/ to path
        if (mode == "preview") {
            if (!p.startsWith("/")) {
                p = "/" + old;
            }
            return "src" + old;
        }
        if (mode == "absolute") {
            if (!p.startsWith("/")) {
                p = "/" + old;
            }
            return "http://function.not.implemented" + old;
        }

    }
    /**
     * Rewrite single attr by name
     * @param sel D3 Selection containing _tag_ to rewrite
     * @param uri {String} uri of page
     * @return attr *value* or null  */

    function _rewriteLinkAttr(attr, old, uri) {
        //R4.log("rewrite" , attr , "from" , old , "at" , uri);
        var r = old;
        if (!old) {
            return null;
        }
        //static = make relative        
        if (mode == "static") {
            r = getRelativePath(Patops.upOne(uri), old);
        }
        //preview = add src/ to path
        if (mode == "preview") {

            r = old.startsWith("/") ? "src" + old : old;
        }
        if (mode == "absolute") {
            if (!old.startsWith("/")) {
                old = "/" + old;
            }
            r = "http://notimplemented.com" + old;
        }
        R4.debug("rewrite", attr, "from", old, "at", uri, "to", r);
        return r;
    }
    /**
     * Rewrite paths with "passive" links
     * @param d3sel {D3 selection }Selection containing _head tags_ to rewrite
     * @param uri {String} uri of page
     * @return ???
     *  */
    this.rewritePassive = function (d3sel, uri) {
        //R4.log("rewrite passive" , d3sel.node());
        //d3sel.selectAll("href") ;
        //R4.log("go on" );
        // if(this.getAttribute("href").startsWith("/")){
        d3sel //.selectAll() //("[href]")       
            .attr("href", function () {
                //if (!this.getAttribute("href").startsWith("/")) {
                //console.log("CHANGE HREF" , this)
                return _rewriteLinkAttr("href", this.getAttribute("href"), uri);
                // } else {
                // return this.getAttribute("href");
                //}
            })

        //if(this.getAttribute("href").startsWith("/")){


        d3sel //.selectAll() //"[src]")       
            .attr("src", function () {
                //console.log("CHABGE SRC" , this)
                //console.log(this)
                // if (!this.getAttribute("src").startsWith("/")) {
                return _rewriteLinkAttr("src", this.getAttribute("src"), uri);
                //}else{
                // return this.getAttribute("src");
                // }
            })

    }

    this.rewriteClickable = function (d3sel, uri, callback) {
        R4.debug("rewrite clickable", uri, mode);
        console.log("rewrite clickable", d3sel, callback)
        // a href
        if (mode == "static" || mode == "absolute") {
            d3sel
                .attr("href", function () {
                    //if (this.href.startsWith("/")) {
                    //R4.log("Rewriting clickable link from", this.href);
                    return _rewriteLinkAttr("href", this.getAttribute("href"), uri)
                    //} else {
                    //    return this.href;
                    //}
                })
        }
        if (mode == "preview") {
            //return callback(uri); //:NO: uri ==> ???
            d3sel.each(function () {
                var mynode = this;
                console.log("THIS HREF", this.getAttribute("href"), mynode)

                console.log("PREVIEW MODE ADD EVENT LISTENER!!!", callback(mynode.getAttribute("href")));
                d3.select(mynode)
                    .on("mouseover", function () { console.log("mouseover") })

                mynode.addEventListener("click", function (e) {
                    console.log("CLICK REWRITTEN LINK")

                    e.preventDefault();
                    callback(this.getAttribute("href") + "")();
                })
            })



                ;

        }
    }

}