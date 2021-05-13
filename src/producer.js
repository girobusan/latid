
/*

Launch and communicate with web worker 

*/


export function producer() {
    var my = this;
    var work = null;
    console.info("Setup web worker")
    work = new Worker("/_system/scripts/production.js");
    work.postMessage({ "action": "setup" });




    this.current_id = 1;
    this.msgRegistry = {};
    this.callbacks = {
        "generateAll": function (m) {
            console.info(m)
        }
    }

    //messaging
    work.onmessage = function (m) {
        //console.log(m);
        if (m.data.id && my.msgRegistry[m.data.id]) {
            //console.log("Reply to msg" , m.data.id)        
            let myclb = my.msgRegistry[m.data.id];
            //if(myclb.then)
            myclb.resolve(m.data);//.then(myclb); //= Promise.resolve( m.data); 
            delete (my.msgRegistry[m.data.id]);
        } else if (m.data.callback && my.callbacks[m.data.callback]) {
            my.callbacks[m.data.callback](m);
        } else {
            console.info("Worker message:", m.data);
        }
    }

    this.sendMsg = function (obj) {
        let msg = obj;
        msg.id = this.current_id; //stamp it
        this.current_id += 1;
        //console.log("Send message" , msg.id)
        work.postMessage(msg); //send it

        return new Promise(function (res, rej) {
            my.msgRegistry[obj.id] = { resolve: res, reject: rej };
        });
    }

    this.registerCallback = function (ev, f) {
        console.log("Callback added" , ev)
        this.callbacks[ev] = f;
    }
    this.removeCallback = function (ev) {
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
    this.getHTML = function (val, fld , preview) {
        return this.sendMsg({ "action": "getHTML", "value": val, "field": fld , "preview":preview});
    }

    this.getSettings = function () {
        return this.sendMsg({ "action": "getSettings" });
    }

    this.getBase = function () {
        return this.sendMsg({ "action": "getBase" });
    }

    this.getView = function (val, fld) {
        return this.sendMsg({ "action": "getView", "value": val, "field": fld });
    }

    this.save = function (v) {
        return this.sendMsg({ "action": "saveFile", "view": v });
    }

    this.saveBinary = function (p, c) {
        return this.sendMsg({ "action": "saveBinary", "path": p, "content": c });
    }

    this.findFreePath = function (p) {
        return this.sendMsg({ "action": "findFreePath", "path": p });
    }

    this.init = function () {
        return this.sendMsg({ "action": "init" });

    }



}
