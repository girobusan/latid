/*
  
  Production worker
 
 */

const Path = require("path")
import { routines } from "./production";
import { makeMessaging } from "./production_worker_messaging";
console.info("Worker: web: on");
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
const api_root = "/api/";

var serv = {
    "base": "/",
    "get": function (p) {

        return fetch(Path.join("/" , p))
            .then(r => r.arrayBuffer())
            .catch(err => console.error(err))

    },
    "getSync": function (p) {
        var request = new XMLHttpRequest();
        if(p.match(/\.(njk|txt)$/)){
            request.overrideMimeType("text/plain");
        }
        
        request.open("GET", Path.join("/" , p), false);
        request.send(null);
        if (request.status == 200) {          
            return request.response;
        } else {
            console.error("Can not getSync", p, "code", request.status)
            return null;
        }

    },
    "write": function (p , cnt) {
        //console.log("Production: web: write" , p);
        return new Promise(function (resolve, reject) {
            fetch(api_root + "write/?" + p, {
                method: "POST",
                body: cnt,
                headers: {
                    "Content-length": (new TextEncoder().encode(cnt)).length
                }
            })
                .then(function (r) {
                    //console.log(r)
                    if (r.status == 200) {
                        //mconsole.log("Production: web: written" , p)
                        resolve()
                    } else {
                        reject("Can not write", p, "status", r.status);
                    }
                })

                .catch(function (err) {
                    //.err("malformed responce?" , path , err)
                    reject("Error writing:" + p + ":" +  err);
                })


        });
    }, //end write
    "writeSync": function (c, p) {
        var request = new XMLHttpRequest();
        request.open("POST", api_root + "write/?" + p, false);
        request.send(c);
        if (request.status == 200) {
            return request.response.arrayBuffer;
        } else {
            console.error("Can not writeSync", p, "code", request.status)
            return null;
        }
    },
    "list": function (p) {
        //console.log("LIST called")
        //var request = new XMLHttpRequest();
        return new Promise(function(res,rej){
            return fetch(api_root + "list/?" + p)
            .then(r=>r.json())
            .then(function(r){
                //console.log("LIST result" , r)
                if(r.status==='success'){
                    //console.log("Sucessful list", p , r);
                    res(r.details.map(e=>{e.path = e.path.replace(/^\// , "") ; return e} )) 
                }else{
                    rej("List impossible:" , p)
                }
            })
        })

/*
        return fetch(api_root + "list/?" + p)
            .then(r => r.json())
            .then(j=>j.details.map(e=> { e.path = e.path.replace(/^\/+/ , "") ; return e }))
            .catch(err => console.error("Can not list", p , err))
            */
    },
    "copy": function (p1, p2) {
        return fetch(api_root + "copy/?from=" + p1 + "&to=" + p2);
    }

}

//
self.setup = function(){
    console.log('Local webserver worker setup');
}

var Production = new routines(serv);
//ping
setInterval(function(){
//ping server
        var request = new XMLHttpRequest();
        
        request.overrideMimeType("text/plain");
        request.open("GET", api_root + "areyouthere" , false);
        request.send();
        if (request.status == 200) {
            
            console.info("%c...server pinged..." , "color: gray");
        } else {
            console.error("Server doesn't work")
            postMessage({"callback" : "serverError" , "type": "no_server"})
        }

}, 10000)

//
onmessage = makeMessaging(Production , self , "local web server");
