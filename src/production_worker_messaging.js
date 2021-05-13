/*
worker functions, 
which will be called by preview/editor process

*/

//    0 init => Promise => void

//    0 generateAll (callback) => Promise => void
//    0 getHTML (with base tag) => html (Promise?=>html)
//    0 save file (edited view)  (view) => Promise=> void
//    0 save binary file 
//    0 get View!!! 

export function makeMessaging(Production, wrkr, WorkerType) {
    //console.info("Init messaging for" , WorkerType);
    return function (m) {
        //console.log("Worker: message", m.data.action);
        switch (m.data.action) {
            case "setup":
                wrkr.setup(m.data);
                break;

            case "init":
                Production.init(() => {
                    //console.log("start loading all")
                    Production.loadAll( function(s){
                        s.callback = "loadAll";
                        postMessage(s);

                    })
                        .then(() => { postMessage({ "id": m.data.id, "ready": true }) })
                } , m.data.options);
                break;

            case "findFreePath":
                this.postMessage({ "id": m.data.id, "path": Production.findFreePath(m.data.path) });
                break;

            case "generateAll":
                Production.generateAll(function (s) {
                    s.callback = "generateAll";
                    postMessage(s);
                });
                break;

            case "getBase":
                this.postMessage({ "id": m.data.id, "base": Production.getBase("") });
                break;

            case "getHTML":
                let h = Production.getHTMLSync(m.data.value, m.data.field, true , m.data.preview);
                if (h) {
                    postMessage({ id: m.data.id, ok: true, html: h });
                } else {
                    postMessage({ id: m.data.id, ok: false });
                }
                break;

            case "getView":
                let v = Production.getView(m.data.value, m.data.field);
                if (v) {
                    postMessage({ id: m.data.id, "ok": true, "view": v });
                } else {
                    postMessage({ id: m.data.id, "ok": false, "view": null });
                }
                break;

            case "saveFile": {
                console.log("Worker: saving...")
                Production.save(m.data.view)
                    .then(() => postMessage({ id: m.data.id, ok: true }));
                break;
            }
            case "saveBinary":
                console.log("Worker: saving binary...")
                Production.addFile(m.data.path, m.data.content)
                    .then(() => postMessage({ id: m.data.id, ok: true }))
                    .catch(() => postMessage({ id: m.data.id, ok: false }))
                break;

            case "getSettings":
                this.postMessage({ id: m.data.id, "settings": Production.getSettings() });
                break;
        }
    }
}
