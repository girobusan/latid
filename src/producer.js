//spawn and init worker
import * as Path from "path";


export function producer() {
    var my = this;
    var work = null;
   // if(window.localFS){
      //  work = new Worker("file://" + Path.join(window.localFS.base , "_system/scripts/production_node.js"));
      //  work.postMessage({"action": "setup" , "base" : window.localFS.base});

    //}else{
        work = new Worker("/_system/scripts/production.js");
        work.postMessage({"action": "setup"});
   // }
    
    
    
    this.current_id = 1;
    this.msgRegistry = {};
    this.callbacks = {
        "generateAll" : function(m){
            console.info(m)
        }
    }

    //messaging
    work.onmessage = function (m) {
        //console.log(m);
        if (m.data.id && my.msgRegistry[m.data.id]) {    
            //console.log("Reply to msg" , m.data.id)        
            my.msgRegistry[m.data.id].resolve(m.data) ; //= Promise.resolve( m.data); 
            delete(my.msgRegistry[m.data.id]);
        } else if (m.data.callback && my.callbacks[m.data.callback]){
            my.callbacks[m.data.callback](m);                  
        } else { 
            console.warn("Unregistered message:", m);
        }
    }

    this.sendMsg = function (obj) {
        let msg = obj;
        msg.id = this.current_id; //stamp it
        this.current_id += 1;
        //console.log("Send message" , msg.id)
        work.postMessage(msg); //send it
        
        return new Promise(function(res,rej){
            my.msgRegistry[obj.id] = {resolve:res , reject:rej };              
        });         
    }

    this.registerCallback = function(ev ,  f){
        this.callbacks[ev] = f;
    }
    this.removeCallback = function(ev){
        this.callbacks[ev] = null;
    }

    //work logic
    //worker functions, 
    //which will be called by preview/editor process
    //
    //    0 generateAll (callback) => Promise => void
    //    0 getHTML (with base tag) => html (Promise?=>html)
    //    0 getView
    //    0 save file (edited view)  (view) => Promise=> void
    //    0 save binary file  => Promise => void

    this.generateAll = function () {
        return this.sendMsg({ "action": "generateAll" });
    }
    //Production.getHTMLSync(m.data.value, m.data.field, true);
    this.getHTML = function (val, fld) {
        return this.sendMsg({ "action": "getHTML", "value": val, "field": fld });
    }

    this.getSettings = function(){
        return this.sendMsg({"action" : "getSettings"});
    }

    this.getBase = function(){
        return this.sendMsg({"action" : "getBase"});
    }

    this.getView = function (val, fld) {
        return this.sendMsg({ "action": "getView", "value": val, "field": fld });
    }

    this.save = function (v) {
        return this.sendMsg({ "action": "saveFile", "view": v });
    }

    this.saveBinary = function (p,c) {
        return this.sendMsg({ "action": "saveBinary", "path": p , "content": c});
    }

    this.findFreePath = function(p){
        return this.sendMsg({ "action": "findFreePath", "path": p });
    }

    this.init = function(){
        return this.sendMsg({"action" : "init"});
       
    }
    
    

}