
import * as Listops from "./listops";
import * as Pathops from "./pathops";
import * as Util from "./util";
import * as Tags from "./tags.js";
import * as Formats from "./formats";
import { msort } from "./nunjucks_template";

export function refreshViewsWeb(l4 , vlist){
    l4.views = vlist.filter(e=> (!e.virtual));
    //console.log("REAL" , real)
    l4.views.forEach(e=> {if(e.tagslist){delete(e.tagslist)}});
    l4.views.forEach(e=> {if(e.tagged){delete(e.tagged) }} );
     l4.lister = new Listops.lister(l4.views);
    
    l4.meta.tags = [];
    //debugger;
    //tags
    Tags.makeTags(l4);
    //multipage
    l4.views.forEach(v => makeMultipageIndex(l4, v, l4.views));
    l4.views.forEach(v => makeMultipageTag(l4, v, l4.views));
    l4.views.forEach(v => makeCustomList(l4, v, l4.views));
   

}

export function makeFileListFromViews(vlist){
    return vlist
    .filter(e=> !e.virtual)
    .map(f=> ({"path" : f.path}))
    ;
}

export function makeCopyView(p) {
    //console.log("making copy view" , p)
    return {

        "type": "copy",
        "path": p,
        "uri": "/" + p
    }
}

export function makeSrcView(p, u, fjsn ){
    //fjsn.magic = "Latid"; ??
    //console.log("SRC" , p)
    return {
        "type": "src",
        "path": p,
        "uri": u,
        "file": fjsn,
    }
}


export function makeViewFromPath(l4, fp , getter) { //this one checks content of file
    if(!getter){ //accessor return Promise => content of file as object
        getter = function(p){
            return l4.server.get("src/" + p)
        }
    }
    return new Promise(function (resolve, reject) {
        if (fp.endsWith(".json")) {
            getter(fp)
                .then(
                    function (r) {
                        //console.log(typeof r) 
                        resolve(makeViewFromContent(fp, r));
                    }
                )
                .catch(function (e) { console.error(e) })
        } else {
            //just path
            resolve(makeViewForLink(fp));
        }

    });
}

export function addView(v , appender) {
    //console.log('ADD VIEW:', l4, v);
    if(!appender){
        //console.log("I DO NOT HAVE APPENDER" , v.uri)
        l4.views.push(v);
    }else{
        //console.log("I HAVE APPENDER" , v.uri)
        appender(v);
    }
    // console.log("PUSH VIEW" , l4.views )
    return v;
}

export function makeViewForLink(p) { //need nothing
    return new Promise(
        function (resolve, reject) {
            p.replace(/^[\\\/]/ , "");
            resolve({ "type": "copy", "path": p, "uri": "/" + p });
        }
    )
}
/**
 * 
 * @param {View} v                  - view with list
 * @param {Array} viewlist          - list of views to be attached
 * @param {Number} [listmax=20]          - max items on one page (20)
 * @param {String} [list_field_name = "pages_list"]  - save lists to that field (pages_list) 
 * @param {Function} accessor       - function, which adds new view to pool (addView)
 */
export function buildPagesSequence(v, viewlist, listmax, list_field_name , putter) {//returns last page number
     //do we sort?
     if ("sort_by" in v.file.meta && v.file.meta.sort_by){
         //we need to sort
         let numeric = v.file.meta.sort_as_number || false;
         let reverse = v.file.meta.sort_reverse || false;
         viewlist = msort(viewlist , reverse , v.file.meta.sort_by , numeric); 

     }
    //console.log("BUILD PAGE SEQUENCE");
    //defaults    
    if (!list_field_name) {
        //console.log("DEFAULT NAME")
        list_field_name = "pages_list";
    }
    //console.log(listmax)
    if (!listmax) {
        //console.log("DEFAULT LISTMAX")
        listmax = 20 ; //l4.settings.list_max;
    }
    //console.log(putter)
    if(!putter){
        //console.log("DEFAULT PUTTER")
        putter = addView;
    }
  
     //console.log("DANCE DANCE")
    var pages_num = Math.ceil(viewlist.length / listmax);
    //console.log(v.uri, "will have", pages_num, "pages")
    v.current_page = 0;
    //if single page -- do nothing
    if (pages_num <= 1) {
        //console.log("ONE PAGE" , v)
        v[list_field_name] = viewlist;
        return 0;
    }
    //create list of page uris... shared between all created pages
    //console.log("LOTS OF PAGE" , v.uri)
    v.pager_uris = [v.uri]
    var baseuri = v.uri

    //mark current    

    v[list_field_name] = viewlist.slice(0, listmax);

    //make views for each subsequent page
    for (var pn = 1; pn < pages_num; pn++) {
        //console.log("multipaging", pn)
        // -- copy first one
        var newview = Object.assign({}, v);
        newview.virtual = true;
        // -- it should not be listed
        newview.nolist = true;
        // -- generate it's uri
        newview.uri = Util.addNumToURI(baseuri, pn);
        // -- add uri to list (which is shared between copies)
        v.pager_uris.push(newview.uri);
        // -- set current page
        newview.current_page = pn;
        // -- create list body
        newview[list_field_name] = viewlist.slice(pn * listmax, pn * listmax + listmax);
        //console.log("PUTT" , putter , newview)
        putter(newview);
        //console.log("YEAH" , putter)
    }
    return v.pager_uris.length - 1;

}

//in: view && list to split
//out: generated and altered views

export function makeMultipageIndex(l4, v, viewlist , putter , listm) { //for index files 
    //
    var listmax = listm || l4.settings.output.list_max;
    var is_it_index = Pathops.isIndex(v.path) || ("file" in v && "meta" in v.file && "list" in v.file.meta);    //TODO: add ability to multipage tags pages
    if (!is_it_index || v.nolist ||!v || !("file" in v)) {
        return;
    }
    //figure out, what to list (default - files)
    var lists = ("meta" in v.file && "list" in v.file.meta && v.file.meta.list) ? v.file.meta.list : "pages";
    if(lists=="none"){
        return;
    }
    //create list  
    //******** 
    var mylist = Pathops.listDirectSiblings(v.uri, viewlist, lists, function (n) { return n.uri })
    .filter(m => m.type == "src" && m.uri != v.uri);
    //********
    //console.log(v.uri, "will have", mylist.length, "items", "listing", lists, mylist);

    buildPagesSequence(v, mylist , listmax , null , putter);

}

export function makeCustomList(l4, v , viewlist , putter , listm){
    //no custom lists for tags
    if(("tagged" in v )){
        return;
    }
    var listmax = listm || l4.settings.output.list_max ;
    //lists (pages)
    //console.log(v)
    let lists = v.file && "meta" in v.file && "list_custom" in v.file.meta && v.file.meta.list_custom ? v.file.meta.list_custom : null ;
    if(!lists){return}    
    function getProp(o , c){
        //console.log(o , c)
        let r =  c.reduce( (a , i) => a[i] , o);
        //console.log("PROP" , r)
        return r;
    }
    //include_regexp (/.+/)
    let inc_rx = v.file.meta.include_regexp ? new RegExp(v.file.meta.include_regexp) : /.+/g ;    
    //exclude_regexp (null)
    let exc_rx = v.file.meta.exclude_regexp ? new RegExp(v.file.meta.exclude_regexp) : /^$/g ;   
    //criteria (uri)
    let criteria = v.file.meta.list_criteria ? v.file.meta.list_criteria.split(".") : ["uri"];
    let mylist = viewlist
    .filter(e=> !v.nolist) //remove not listed
    .filter(e=> e.type=="src")
    //.filter(e=> !("tagged" in e)
    .filter(a=> Pathops.isIndex(a.path)&&lists=="dirs" || !Pathops.isIndex(a.path)&&lists=="pages" ) //pages or dirs
    .filter(w=> getProp(w , criteria).match(inc_rx) != null) //include
    .filter( u => getProp(u , criteria).match(exc_rx)=== null)
    ;
    buildPagesSequence(v, mylist , listmax , null , putter);
}

export function makeMultipageTag(l4, v , viewlist , putter , listm){
    if(!("tagged" in v)||v.nolist){
        return;
    }
    //
    //var lists = "pages";
    //buildPagesSequence(l4, v, viewlist, listmax, list_field_name) 
    buildPagesSequence( v , v.tagged , listm||20 , "tagged_list" , putter);
}

export function makeViewFromContent(path, fcontent) {
    //console.log("MAKE VIEW FROM CONTENT");
    return new Promise(function (resolve, reject) {
        //console.log("CNT" , typeof fcontent)
        if (path.endsWith(".json") && "meta" in fcontent && "content" in fcontent) {
            //console.log("GOOD");
            resolve({
                "type": "src",
                "path": path,
                "uri": "/" + path.replace(/\.json$/gi, ".html"),
                "file": fcontent,
                //"toString": function () { return "View of src" + this.uri }
            }); //which path?!
        } else {
            resolve({
                "type": "copy",
                "path": path,
                "uri": "/" + path,
                "file": fcontent,
                //"toString": function () { return "View of copy" + this.uri }
            }); //which path?!
        }
    });
}



export function makeViews(flist , getter) {
    //console.log("files" , l4.files)
    return new Promise(
        async function (resolve, reject) {
            function wrap(pm) {
                return pm.then(
                    (v) => {
                        return { status: 'fulfilled', value: v };
                    },
                    (error) => {
                        return { status: 'rejected', reason: error };
                    }
                );
            }

            var promises = [];        

            for (var f in flist) {
                promises.push(wrap(Formats.decodeFileFromPath(flist[f].path , getter))
                );
            }


            var promises_result = await Promise.all(promises);

            //console.log( "PR" , promises_result);
            let views =
                promises_result.filter(function (e) { return e.status != "rejected" })
                    .map(function (e) { return e.value });
            views.sort(function (a, b) {
                if ("file" in a && "file" in b && "date" in a.file && "date" in b.file) {
                    return Util.str2date(a.file.date).getMilliseconds() - Util.str2date(b.file.date).getMilliseconds();
                } else {
                    if (a.path > b.path) {
                        return 1
                    }
                    if (a.path < b.path) {
                        return - 1
                    }
                    return 0;
                }
            });

            resolve(views);


        });

}


