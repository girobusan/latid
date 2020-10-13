//tagger
import * as Views from "./views";
import * as Util from "./util";
import * as Listops from "./listops";

const tagview = {
    tagged: [],
    path: "",
    uri: "",
    type: "src",
    virtual: true,

    file: {
        content_format: "blocks",
        meta: {},
        content: {
            blocks: []
        }

    }
}

export function makeTagViewNew(uri, name, appender) {

    var r = JSON.parse(JSON.stringify(tagview))
    //console.log(r)
    r.uri = uri;
    r.title = name;
    r.file.meta.title = name;
    //console.log("2" , appender , typeof r)
    appender(r);
    //console.log("return///")
    return r;
}


export function makeTagView(uri, name, appender) {

    var r = JSON.parse(JSON.stringify(tagview))
    //console.log(r)
    r.uri = uri;
    r.title = name;
    r.file.meta.title = name;
    //console.log("2" , r)
    return Views.addView(r, appender);
}
//without l4 - right way
export function makeTagsNew(viewlist, settings,appender) { // views=>lister , settings l4
    //console.log("TAGS")
    var lister = new Listops.lister(viewlist);
    var tagmeta = {};
    if(!appender){appender = t => { viewlist.push(t)}}
    //loop throu all views
    viewlist.forEach(function (e) {
        //is there tags?
        //console.log("make tag" , e)
        if (e.type != "src" || e.nolist) { return }
        //console.log(e);
        if ("tags" in e.file.meta && e.file.meta.tags) {
            //console.log(e.file.meta.tags)
            //do file have taglist
            //if (!("tagslist" in e)) { e.tagslist = [] }
            e.tagslist = [];
            var tagarray = e.file.meta.tags.split(",").map(ee => ee.trim());

            tagarray.forEach(function (t) {
                //console.log("FORYCH")
                var tagtranslit = Util.translit(t.toLowerCase()) == "index" ? "indexx" : Util.translit(t);
                var taguri = Util.gluePath(settings.tags.dir, tagtranslit + ".html");
                var tagpath = Util.gluePath(settings.tags.dir.replace(/^\//, ""), tagtranslit + ".json");
                //tag view?
                var nv = lister.getByField("uri", taguri);

                //if no meta record, add meta record
                if (!(tagtranslit in tagmeta)) {
                    tagmeta[tagtranslit] = {
                        "name": t,
                        "slug": tagtranslit,
                        "uri": taguri,
                        "pages": []
                    }

                }
                //if no tag view
                //console.log("NO TAG VIEW" , t  , nv)
                if (!nv) {
                    nv = makeTagViewNew(taguri, t, appender);
                    nv.path = tagpath;
                    nv.file.meta.title = t;
                    //nv.tagged.push(e)
                } else if (!("tagged" in nv)) {
                    nv.tagged = []
                }

                if(tagmeta[tagtranslit].pages.indexOf(e)==-1){
                    tagmeta[tagtranslit].pages.push(e)
                }

                if (nv.tagged.indexOf(e) == -1) {
                    nv.tagged.push(e);
                    //tagmeta[tagtranslit].pages.push(e)
                } //else {
                    //console.log("IN LIST", e , nv.tagged)
                //}

                //l4.debug("Add tag", taguri, t)
                e.tagslist.push(nv);
            });
        }
    });
    //console.log("tagmeta", tagmeta)
    return Object.values(tagmeta).map(e => { e.count = e.pages.length; return e });
}

export function makeTags(l4, appender) { // views=>lister , settings
    //console.log("TAGS")
    var tagmeta = {};
    if(!appender){appender = Views.addView}
    //loop throu all views
    l4.views.forEach(function (e) {
        //is there tags?
        //console.log("make tag" , e)
        if (e.type != "src" || e.nolist) { return }
        //console.log(e);
        if ("tags" in e.file.meta && e.file.meta.tags) {
            //console.log(e.file.meta.tags)
            //do file have taglist
            //if (!("tagslist" in e)) { e.tagslist = [] }
            e.tagslist = [];
            var tagarray = e.file.meta.tags.split(",").map(ee => ee.trim());

            tagarray.forEach(function (t) {
                //console.log("FORYCH")
                var tagtranslit = Util.translit(t.toLowerCase()) == "index" ? "indexx" : Util.translit(t);
                var taguri = Util.gluePath(l4.settings.tags.dir, tagtranslit + ".html");
                var tagpath = Util.gluePath(l4.settings.tags.dir.replace(/^\//, ""), tagtranslit + ".json");
                //tag view?
                var nv = l4.lister.getByField("uri", taguri);

                //if no meta record, add meta record
                if (!(tagtranslit in tagmeta)) {
                    tagmeta[tagtranslit] = {
                        "name": t,
                        "slug": tagtranslit,
                        "uri": taguri,
                        "pages": []
                    }

                }
                //if no tag view
                //console.log("NO TAG VIEW" , t  , nv)
                if (!nv) {
                    nv = makeTagView(taguri, t, appender);
                    nv.path = tagpath;
                    nv.file.meta.title = t;
                    //nv.tagged.push(e)
                } else if (!("tagged" in nv)) {
                    nv.tagged = []
                }

                if(tagmeta[tagtranslit].pages.indexOf(e)==-1){
                    tagmeta[tagtranslit].pages.push(e)
                }

                if (nv.tagged.indexOf(e) == -1) {
                    nv.tagged.push(e);
                    //tagmeta[tagtranslit].pages.push(e)
                } //else {
                    //console.log("IN LIST", e , nv.tagged)
                //}

                //l4.debug("Add tag", taguri, t)
                e.tagslist.push(nv);
            });
        }
    });
    //console.log("tagmeta", tagmeta)
    l4.meta.tags = Object.values(tagmeta).map(e => { e.count = e.pages.length; return e });
}