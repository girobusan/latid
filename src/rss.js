

//var RSS = require('rss');
const feedster = require('feed-generator');
import * as Util from "./util";
import * as Pathops from "./pathops";
import * as LinkRepl from "./link_replacer";

const path = require("path");




export function buildRSS(settings, views) {
    let LR = new LinkRepl.rewriter(views);
    
    /*if (!writer) {
        writer = function (rs) {
            console.log("Default RSS writer")
            //
            //    LATID$.server.write( feed.render({indent: true}), Util.gluePath("static" , LATID$.settings.rss_uri) ) ;
            let c = rs;//feed.render({indent: true});
            let p = Util.gluePath("static", LATID$.settings.rss.uri);
            LATID$.server.write(c, path.join(LATID$.settings.output.dir , LATID$.settings.rss.uri));

        }
    }*/
    console.log("Building RSS")
    var feed = feedster.createFeed(
        {
            title: settings.site.title,
            description: settings.site.motto,
            link: settings.site.url
        }
    )

    //items
    //console.log("TO RSS" , LATID$.views.length)
    var items = views
        .filter(v => "file" in v && !v.nolist && (v.file.meta && !v.file.meta.nolist) && !Pathops.isIndex(v.uri) && "meta" in v.file && !v.file.meta.nolist && "date" in v.file.meta && Util.str2date(v.file.meta.date))
        //.sort(function (a, b) {
            //console.log(a , b);
        //    return Util.str2date(a.file.meta.date).getMilliseconds() - Util.str2date(b.file.meta.date).getMilliseconds();
        //})
        .slice(0, parseInt(settings.rss.count) - 1)
        ;



    items.forEach(function (e) {
        //description 
        let dsc = //"<![CDATA[" +
            Util.guessExcerpt(e) ;//+
            //(Util.guessImage(e) ? "<p><img src='" + Util.guessImage(e) + "'></p>" : "") +
           // "]]>";
        let itemimg = Util.guessImage(e);
        if(itemimg){
            dsc +="<p><img src='" + Util.gluePath(settings.site.url , itemimg) + "'></p>";
        }
        let enc = itemimg ? Util.gluePath(settings.site.url , itemimg) : null;
        //
        feed.addItem({
            title: e.file.meta.title,
            link: Util.gluePath(settings.site.url, e.uri),
            guid: Util.gluePath(settings.site.url, e.uri),
            description: LR.rewriteAllLinks(dsc, null, settings.site.url),
            pubDate: Util.str2date(e.file.meta.date).toISOString(),
            enclosure: {url:enc}
        })
    });

    let cn = feed.render({ indent: true });
    //CHANGE TO:
    //write using server to src
    //LATID$.server.write(cn , Util.gluePath("src" , LATID$.settings.rss.uri));
    //create view
    //NEED TO FIX logoc in Views.js
    console.log("RSS built");
    return cn;
    //console.log("rss built")

}
