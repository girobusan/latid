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
          "blocks": [ 
           {
              "type": "paragraph",
              "data": 
              {
              "text": "Lorem Ipsum"
              }
          }

          ]
        }
    }
};


/**
 * makeEmptyView.
 *
 * @param {String} title
 * @param {String} pth
 * @param {Object} meta
 * @param {Boolean} isMarkdown
 */
export function makeEmptyView(title, pth , meta , isMarkdown) {
console.log(title, pth , meta , isMarkdown);
    let bs = JSON.parse(JSON.stringify(Empty));
    if(isMarkdown){
        bs.file.content_format = "markdown";
        bs.file.content = "Lorem Ipsum"
    }
    bs.file.meta.title = title;
    bs.path = pth;
    bs.file.meta.id = uuidv1();
    bs.file.meta.date = Util.date2str(new Date())
    //TMP
    bs.uri = "/" + pth.replace(/\.[a-zA-Z]+$/ , ".html");
    if(meta){
        bs.file.meta = Object.assign(bs.file.meta , meta, )
       //return Object.assign(bs , {"file": {"meta" : meta}})
    }
    // console.log("isMarkdown", isMarkdown);
    // console.log("Created view" , bs);
    return bs;
}


