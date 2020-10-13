//import * as Pathops from "./pathops";
//import * as Listops from "./listops";
//import * as Views from "./views";
import * as Util from "./util";
const uuidv1 = require('uuid/v1');

//; // ⇨ '2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d'
const Empty =
{
    "type": "src",
    "file": {
        "content_format": "blocks",
        //"modified": true,
        "type": "src",
        "meta": {            
            "title": ''
        },
        "content": {
            "blocks": []
        }
    }
};

export function makeEmptyView(title, pth) {
    let bs = JSON.parse(JSON.stringify(Empty));
    bs.file.meta.title = title;
    bs.path = pth;
    bs.file.meta.id = uuidv1();
    bs.file.meta.date = Util.date2str(new Date())
    //TMP
    bs.uri = "/" + pth.replace(/\.json$/ , ".html");
    return bs;
}


