var unidecode = require('unidecode');
import * as Pathops from "./pathops";
import { tickIncrement } from "d3";

export function ticker(tick) {
    this.callback = () => console.log("tick...");


}

export function date2str(d, short) {
    if (!d) {
        //console.log("NO DATE GIVEN");
        return "?";
    }
    if (!(d instanceof Date)) {
        //console.log("IT IS NOT A DATE", d)
    }
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hrs = d.getHours();
    var mins = d.getMinutes();
    let ds = "" + year + "." + (month + 100).toString().substring(1) + "." + day;
    if (!short) { ds += " " + (100 + hrs).toString().substring(1) + ":" + mins };
    return ds;
}



export function str2date(st) {
    //console.log( "STRTODATE START" , st);
    // 2020.04.3 9:10
    if (!st) {
        return new Date()
    };
    var str = st.toString().trim();
    //if timestamp (digits only)
    if (str.match(/^\d{12,}$/)) {
        var r = new Date(parseInt(str));
        //test if correct date
        //if (r.getTime() == r.getTime()) {
            return r
        //} else {
            //return null;
        //}
    }
    //if js formatted string
    /*
    let ir = new Date(str);
    if (ir.getTime() == ir.getTime()) {
        return ir;
    }
    */

    //if our custom

    var parts = str.split(/[^0-9]+/g).map(e => parseInt(e)).filter(e => !isNaN(e));
    if (parts.length < 3) {
        //console.log("NULL DATE FROM" , st)
        return null;
    }
    var rd = new Date();
    try {
        rd.setFullYear(parts[0]);
        rd.setMonth(parts[1] - 1);
        rd.setDate(parts[2]);

        //}
        if (parts.length >= 5) {
            rd.setHours(parts[3]);
            rd.setMinutes(parts[4]);
        }
    } catch (err) {
        console.log("Invalid date", str, err);
        return null;
        //console.log("STR2DATE", st, "=>", rd)      

    }
    return rd;
}

    export function prettyDate(s) {
        return date2str(str2date(s), true);
    }


export function pageSortValue(e) {

    if ("file" in e && "meta" in e.file && "date" in e.file.meta) {
        var mydate = str2date(e.file.meta.date);
        if (mydate) {
            return mydate.getTime();
        }
    } else {
        return 0;
    }

}


export function translit(str) {
    var decoded = unidecode(str.trim()).toLowerCase().replace(/\s+/g, "_");
    var bad = /[^a-z0-9_.-]/g;
    return decoded.replace(bad, "")
}
/*

export function dateToRSS(dt) {
    function pad2(n) {
        return (n + 100).toString().substring(1);
    }
    var dw = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()];
    var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()];
    var r = dw + ', ' + pad2(dt.getDate()) + " " + mo + " " + dt.getFullYear() +
        " " + pad2(dt.getHours()) + ":" + pad2(dt.getMinutes()) + ":00 " + 'GMT'
    //Wed, 02 Oct 2002 15:00:00 +0200
    //<pubDate>Wed, 02 Oct 2002 13:00:00 GMT</pubDate>
    return r; //dt.toString(); //TMP

}
*/

export function addNumToURI(uri, num, pad) {
    //if (!pad) { pad = 3 };
    if(pad){
        let pv = 1;
        for(i = 0 ; i <= pad ; i++){
            pv = pw*10
        }
        num = (pv+num).toString().substring(1);
    }
    return uri.replace(/(.+)(\.[a-z]+$)/i, function (match, p1, p2) {
        return p1 + "_" + num + p2
    })
}

export function gluePath() {
    //console.log("my args" , arguments)
    let flarg = Array.from(arguments);//.reduce((acc, val) => acc.concat(val));
    if (flarg.length == 1) {
        return flarg[0];
    }
    // console.log(flarg);
    let result = flarg
        .filter(e => e)
        .map(z => z.replace(/\\$/g, "/")) //windows slash to normal slash 
        .map(function (x, i) {
            if (i != 0) {
                return x.replace(/^\//, ""); //remove starting slash, exept first part
            } else {
                return x;
            }
        })
        .map(function (s, i, a) {
            if (s.lastIndexOf("/") + 1 != s.length && ((i + 1) < a.length)) { //add final slash if not there AND if not last part                                     
                return s += "/"
            } else {
                return s;
            }
        })
        .join("") //combine
    //console.log("my result" , result);
    return result;

}

export function guessExcerpt(view) {
    //console.log("Guessing excerpt" , view.uri);
    if ("meta" in view.file && "excerpt" in view.file.meta) {
        return view.file.meta.excerpt.replace(/\<img[^>]+\>/gi, "");
    }
    //console.log(view.file);
    if (view.file.content_format == "blocks" && view.file.content.blocks.length > 0) {
        //console.log("simple!" , view.file.content.blocks);
        // var r = null;
        let prs = view.file.content.blocks.filter(e => e.type == "paragraph");
        //console.log(prs)
        return (prs && prs.length > 0) ? prs[0].data.text : "";
    }
    return "";
}

export function guessImage(view) {
    //console.log("Guess image", view, );
    if ("file" in view && "meta" in view.file && "image" in view.file.meta && view.file.meta.image) {
        //image found in meta
        return view.file.meta.image;
    }
    var rx = /\<img[^>]*src\s*=\s*['"]?\s*([^\s'"]+)\s*['"]?/gi;

    if (view.file.content_format == "blocks") {
        //blocks    
        let imgs = view.file.content.blocks
            .filter(e => ['image', 'video'].indexOf(e.type) != -1)
            .map((e) => {
                if (e.type == 'image') { return e.data.file.url }
                else if (e.data.poster) { return e.data.poster } return null
            })
            .filter(e => e);
        return imgs[0] || null;
    } else {
        //raw content
        let frc = view.file.meta.excerpt || "";
        frc += view.file.content;
        var match = rx.exec(frc);
        return match ? match[1] : null;
    }
} 