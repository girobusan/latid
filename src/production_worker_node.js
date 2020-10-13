const Path = require("path");
import { isBrowser, isNode } from 'browser-or-node';

if(isNode){
    console.log('Looks like node')
    //var fs = require('fs'); //IT"S MAGIC
}else{
    console.log("No node.js access");
}
//import * as fs from "fs";
    

const recursive = require("recursive-readdir");
import { routines } from "./production";
import { makeMessaging } from "./production_worker_messaging";
console.info("Worker: node: on");

//Move to module
var fsbase = null;
//
function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}
//
function ensureDirectoryExistence(filePath) {
    var dirname = Path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
//
/*
{
    0 get:       f(p),      //async ~
    0 write:     f(p,c)     //async ~
    0 getSync:   f(p),      //sync  *
    0 writeSync: f(p , c),      //sync  *
    0 copy:      f(from,to) //async ~
   
    0 list:      f(p),      //async ~ ?
    0 base:      string     //base href for views, specific for loader
}
*/


var serv = {
    "base": "/",
    "get": function (p) {
        return new Promise(function (res, rej) {
            fs.readFile(Path.join(this.base, p), function (err, buff) {
                if (err) {
                    rej(err);
                }
                res(toArrayBuffer(buff));
            });
        });
    },

    "getSync": function (p) {
        return toArrayBufer(fs.readFileSync(Path.join(this.base, p)));

    },

    "write": function (p, cnt) {
        //console.log("Production: web: write" , p);
        return new Promise(function (resolve, reject) {
            fs.writeFile(Path.join(this.base, p), cnt, function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            })
        });
    }, //end write

    "writeSync": function (p, cnt) {
        fs.writeFile(Path.join(this.base, p), cnt);
    },

    "list": function (p) {
        //
        let sp = p; //makepath(p);
        let spl = sp.length;
        return new Promise(
            function (res, rej) {
                recursive(sp, function (err, files) {
                    if (err) {
                        rej(err);
                    }
                    let rf = files.map(e => e.substring(spl))
                        .filter(a => !a.startsWith("_"))
                        .map(w => ({ "path": w }));
                    res({ details: rf });

                })
            }
        )
    },
    "copy": function (p1, p2) {
        ensureDirectoryExistence(p2); //TODO makedir from base
        return fs.promises.copyFile(p1, p2);
    }

}

//
self.setup = function(){
    console.log("Node worker setup")
}

var Production = new routines(serv);
onmessage = makeMessaging(Production, self , "node.js");
