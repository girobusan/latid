let baner = "Latid " + VERSION;
let doubleUnderline = baner.replace(/./g , "=");
let singleUnderline = baner.replace(/./g , "-");
// console.log("\nLatid", VERSION);
// console.log("=========");
console.log(doubleUnderline);
console.log(baner);
console.log(doubleUnderline);
console.log("Today:", (new Date()).toLocaleString());
var Path = require("path");
//const fs = require("fs");
const fs = require('fs');//.promises;
const fsp = require('fs').promises;
var opts = {
  output:{
    date_aware_generation: false
  }
};

import * as Production from "./production";

var work_time = (new Date()).getTime();
//read params
var parseargs = require('minimist');
var cliargs = parseargs(process.argv.slice(2));
var sitedir = cliargs.s || process.cwd();//site directory

//time-aware generation
var timeawareness = cliargs.t || false;
if (timeawareness) {
    console.log("Time-aware generation: on")    
    opts = Object.assign(opts,{output:{date_aware_generation:true}})

} else {
    console.log("Time-aware generation: off")
    
}
var do_publish = cliargs.p || false ;

var indir = cliargs.i || Path.join(sitedir, "src");
//
//def functions

function ensureDirectoryExistence(filePath) {
    var dirname = Path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

// List all files in a directory in Node.js recursively in a synchronous fashion
export function reclist(dir, filelist) {
    //var path = path || require('path');
    // var fs = fs || require('fs'), //

    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(Path.join(dir, file)).isDirectory()) {
            filelist = reclist(Path.join(dir, file), filelist);
        } else {
            filelist.push(Path.join(dir, file));
        }
    });
    //if(dir.indexOf("template")!=-1 && false){
      //console.log("RECLIST" , filelist)
    //}
    return filelist;
};

//

var l4 = {
    "loader" : "cli",
    "name": "l4",
    "version": "VERSION",
};
//read settings
// <site dir> + _config/settings.json
l4.settings = JSON.parse(fs.readFileSync(Path.join(sitedir, "_config", "settings.json"), {
    encoding: "utf8"
}));
//l4.settings.output_path = l4.settings.output_path || "static" ;
let confdir = l4.settings.output.dir ? l4.settings.output.dir : "static";

var outdir = cliargs.o || Path.join(sitedir, confdir);//Path.join(sitedir, "static");
l4.settings.output_path = outdir;
console.log("Output to", outdir);
console.log(singleUnderline);




//read all files
//l4.files = l4.server.list(indir);
////console.log("Input files", l4.files.length);
//new production routines
/*
{
      0 |  get:         | f(p),        | async ~
      O |  write:       | f(p,c)       | async ~
      0 |  writeSync:   | f(p , c),    | sync  *
      0 |  copy:        | f(from,to)   | async ~
      0 |  getSync:     | f(p),        | sync  *
      0 |  list:        | f(p),        | async ~ ?
      0 |  base:        | string       | base href for views, specific for loader
}
*/

let fileops = {
    "base": sitedir,
    "get": function (p) {
        //console.log("my get")
        return new Promise(function (res, rej) {
            fsp.readFile(Path.join(sitedir, p))
            .then(r => res(toArrayBuffer(r)))
            .catch(e=>rej(e))
            ;
        })
    },

    "getSync": function (p) {
        if(p.match(/\.(njk|txt|js)$/)){
            return fs.readFileSync(Path.join(sitedir, p) , "utf-8");
        }else{
        return toArrayBuffer(fs.readFileSync(Path.join(sitedir, p)));
        }
    },
    "write": function (p, c) {
        ensureDirectoryExistence(Path.join(sitedir, p));
        return fsp.writeFile(Path.join(sitedir, p), c)
    },
    "writeSync": function (p, c) {
        ensureDirectoryExistence(Path.join(sitedir, p));
        fs.writeFileSync(Path.join(sitedir, p), c);
    },
    "copy": function (fr, t) {
        //let todir = Path.dirname(t);
        ensureDirectoryExistence(Path.join(sitedir, t));
        return fs.promises.copyFile(Path.join(sitedir, fr), Path.join(sitedir, t));
    },
    "list": function (rp) {
        let fulldir = Path.join(sitedir, rp);
        //console.log("Full DIr" , fulldir);

        //let mylist = reclist(fulldir).map(p => ({ "path": p.substring(fulldir.length+1) }));
        //console.log(mylist)
        return new Promise(function (res, rej) {
            if(fs.existsSync(rp)){
            let mylist = reclist(fulldir).map(p => {let fst = fs.statSync(p); /*console.log(fst)*/ ; return { "path": p.substring(fulldir.length+1) , "mtime" : fst.mtime , "mtimeMs" : fst.mtimeMs }});
            //console.log("MULIST" , mylist)
            mylist.forEach(e=>e.path=e.path.replace(/\\/g , "/"));
            res(mylist);
            }else{
                rej("No such dir")
            }
        })

    }
}

let prod = new Production.routines(fileops );

let progress_acc = {};

function printProgress(what , e){
    if(!progress_acc[what]){
        progress_acc[what] = 0;
    }
    if(e.status=='working'|e.status=='loading') {progress_acc[what] += 10};
    //console.log(e , progress_acc[what] );
    if(progress_acc[what]>=parseInt(e.of)){        
        progress_acc[what] += 100;
        console.info(what + ": done at " + ((new Date()).getTime() - work_time) , "ms"  );
        if(e.operation == 'generate_site'){
            console.log(singleUnderline);
        }        
    }    
}

prod.init(function () {

  prod.loadAll(e=>printProgress( "Files loading" , e))
  .then(() => prod.generateAll(  e=>printProgress("Generation" , e) , opts ))
.catch(err=>console.error(err))
  ;
});

