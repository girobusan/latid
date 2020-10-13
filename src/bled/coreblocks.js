import * as UI from "./ui";
import {
    templates
} from "./tools";
import { curveBundle } from "d3";

const d3 = Object.assign({}, require("d3-selection"));

export var constructors = {};


constructors.paragraph = function (data, el, id, editor) {
    let bc = document.createElement("p");
    bc.setAttribute("contenteditable", true);
    el.appendChild(bc);
    //let re = /<div|p|h>/gi;

    let blc = {
        my: this,
        id: id, //!!!!!!!!!!!!!!!!!!!    
        data: data ? data : {
            text: ""
        },
        element: el,
        editor: editor,
        _p: bc,
        //type: "paragraph",
        //clean: function (t) {
        //},
        render: function () {
            this._p.innerHTML = this.data.text;
        },
        save: function () {
            return {
                text: this._p.innerHTML
            }
        }
    }
    blc._p.addEventListener("paste", function (e) {
        //we need to strip formatting here
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(paste));
        event.preventDefault();
    });

    blc._p.addEventListener("keydown", function (e) {
        const magic = "#!#"
        if (e.keyCode == 13) {
            //console.log("enter pressed", e.shiftKey == true);
            if (e.shiftKey) {
                //
            } else {
                document.execCommand("insertText", false, magic);
                let clickat = blc._p.innerHTML.indexOf(magic)
                let textleft = blc._p.innerHTML.substring(0, clickat);
                let textnext = blc._p.innerHTML.substring(clickat + magic.length);
                //console.log(textleft, "|" , textnext);
                blc._p.innerHTML = textleft; //blc._p.innerHTML.substring(0 , clickat);
                let np = editor.addNewBlock("paragraph", {
                    text: textnext
                }, blc.id);
                blc.editor.blocks[np]._p.focus();
                e.preventDefault();
                return;
            };
        }
    })
    return blc;
}

constructors.divider = function (data, el, id, editor) {
    return {
        element: el,
        id: id,
        render: function () {
            el.innerHTML = "<hr>";
        },
        save: function () {
            return {};
        }
    }
}


constructors.header = function (data, el, id, editor) {
    //mytag.

    let blc = {
        element: el,
        //id: id,
        text: data && data.text ? data.text : "Header",
        level: data && data.level ? data.level : 1,
        refresh: function () {
            let alreadythere = this.element.querySelector("h1,h2,h3,h4,h5,h6");
            if (alreadythere) {
                this.text = alreadythere.innerHTML;
            }
            this.element.innerHTML = "";
            let myh = document.createElement("h" + this.level);
            myh.setAttribute("contenteditable", true);
            myh.innerHTML = this.text;
            this.element.appendChild(myh);
        },
        //mytag: 
        render: function () {
            this.refresh();
        },
        save: function () {
            let txt = this.element.querySelector("h1,h2,h3,h4,h5,h6").innerHTML;
            return {
                "text": txt,
                "level": this.level
            }
        }
    }
    let opts = document.createElement("select");
    opts.style.display = "block";
    for (let i = 1; i < 7; i++) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.label = "level " + i;
        opt.innerHTML = "level " + i;
        if (i == blc.level) {
            opt.setAttribute("selected", true)
        }
        opts.appendChild(opt);
    }
    opts.addEventListener("change", function (e) {
        let nv = opts[opts.selectedIndex].value;
        blc.level = nv;
        blc.refresh();
    });
    //class input
    let class_label = document.createElement("label")
    class_label.innerHTML = "Class:"
    //
    let class_input = document.createElement("input")
    class_input.type = "text";
    class_input.value = (data&&data.class) || "";
    class_input.addEventListener("change" , function(){
        data.class = this.value;
    })
    //
    templates.addToolbar(blc);
    blc.addToToolbar(opts);
    blc.addToToolbar(document.createElement("hr"));

    
    blc.addToToolbar(class_label);
    blc.addToToolbar(class_input);
    
    
    return blc;
}

constructors.code = function (data, el, id, editor) {
    let pre = document.createElement("pre");
    let cd = document.createElement("code");
    pre.appendChild(cd);
    cd.setAttribute("contenteditable", true);
    cd.dataset.no_text_toolbox = true;
    cd.addEventListener("paste", function (e) {
        //we need to strip formatting here
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(paste));
        event.preventDefault();
    })
    el.appendChild(pre);
    let langs = ["", "auto", "arduino", "bash", "basic", "cpp", "html", 'javascript', "processing", "python",];
    let lbls = ["No highlighting", "Auto", "Arduino", "Bash", "Basic", "C++", "HTML", 'Java Script', "Processing", "Python",];
    //
    let opts = document.createElement("select");
    langs.forEach(function (e, i) {
        let mi = document.createElement("option");
        mi.value = e;
        mi.label = lbls[i];
        mi.innerHTML = e;
        if (data && data.language && e == data.language) {
            mi.selected = true;
        }
        opts.appendChild(mi);
    });
    //

    let blc = {
        element: el,
        render: function () {
            cd.innerHTML = data && data.code ? data.code : "#  type\n#  here";
        },
        save: function () {
            return {
                code: cd.innerHTML,
                language: opts[opts.selectedIndex].value
            }
        }
    }
    templates.addToolbar(blc);
    blc.addToToolbar(opts);
    return blc;
}

constructors.raw = function (data, el, id, editor) {

    let edi = document.createElement("textarea");
    edi.style.width = "100%";
    edi.style.minHeight = "300px";
    edi.style.boxSizing = "border-box";
    edi.style.border = "2px solid " + UI.mycyan;
    edi.style.padding = "8px";
    if (data && data.html) {
        edi.value = data.html;
    }
    let blc = {
        render: function () {
            el.appendChild(edi);
        },
        save: function () {
            return {
                html: edi.value
            };
        }
    }
    return blc;
}

constructors.blockquote = function (data, el, id, editor) {
    let blctag = document.createElement("blockquote");
    blctag.style.minHeight = "64px";
    let blcin = document.createElement("span");

    blcin.setAttribute("contenteditable", true);
    let blfoot = document.createElement("footer");
    let blcite = document.createElement("cite");
    blfoot.appendChild(blcite);
    blcite.setAttribute("contenteditable", true);

    blctag.appendChild(blcin);
    blctag.appendChild(blfoot);
    blcin.innerHTML = data && data.text ? data.text : "Цитата";
    blcite.innerHTML = data && data.caption ? data.caption : "";

    let block = {
        render: function () {
            el.appendChild(blctag);
        },
        save: function () {
            return {
                text: blcin.innerHTML,
                caption: blcite.innerHTML
            }
        }
    }
    return block;
}

constructors.attachment = function (data, el, id, editor) {
    let blc = {
        element: el,
        render: function () {
            //console.log("render image")
        },
    }
    //panel
    let epanel = document.createElement("div");
    epanel.classList.add("uistyle");
    epanel.classList.add("uicontainer");
    epanel.innerHTML = "<h5>File attachment</h5>"
    //title
    let tlabel = document.createElement("label");
    let tinput = document.createElement("input");
    tinput.type = "text";
    tinput.value = data && data.title ? data.title : "";
    tlabel.innerHTML = "Title:";
    epanel.appendChild(templates.formRow([tlabel, tinput]) , "Title of the file");  
    //src
    let srclabel = document.createElement("label");
    srclabel.innerHTML = "URL:";
    let srcinput = document.createElement("input")
    srcinput.type = "text";
    srcinput.value = data && data.href ?  data.href : "";
    epanel.appendChild(templates.formRow([srclabel, srcinput]) , "Link");
     //+class
     let cllabel = document.createElement("label");
     cllabel.innerHTML = "Add class:";
     let clinput = document.createElement("input")
     clinput.type = "text";
     clinput.value = data && data.class ? data.class : "";
     epanel.appendChild(templates.formRow([cllabel, clinput]));
     //hidden
     let hdlabel = document.createElement("label");
     hdlabel.innerText = "Hidden:";
     let hdcb = document.createElement("input");
     hdcb.type = "checkbox";
     hdcb.checked = data && data.hidden ? data.hidden : false;
     epanel.appendChild(templates.formRow([hdlabel, hdcb]) , "Hide from view");
    //file upload    
    let upld = document.createElement("input");
    upld.type = "file";
    //upld.style.flexGrow = 1;
    let upldbtn = document.createElement("input");
    upldbtn.value = "upload";
    upldbtn.type = "button"
    upldbtn.addEventListener("click", function (e) {
        editor.upload(upld.files[0])
            .then(function (r) {
                //pimg.src = r.file.url;
                srcinput.value = r.file.url;
            })
    });
    epanel.appendChild(templates.formRow([upld, upldbtn]));
  
    //additional class
    el.appendChild(epanel);
    blc.save = function(){
        return {
            title: tinput.value,
            href: srcinput.value,
            filename: srcinput.value.split(/\/\\/g).pop() || "",
            extension: srcinput.value.split(".").pop() || "default",
            class: clinput.value,
            hidden: hdcb.checked
        }
    }
    return blc;

}

constructors.badge = function(data, el, id, editor){
    let blc = {
        element: el,
        render: function () {
            //console.log("render image")
        },
    }
    templates.addToolbar(blc);
    let tag = data && data.tag ? data.tag : "div";
    let classes = data &&data.class ? data.class : "";
    let text = data && data.text ? data.text : "";
    //first render
    let myel = document.createElement(tag);
    myel.setAttribute("contenteditable" , true)
    myel.setAttribute("class" , "badge " +  classes);
    myel.innerHTML = text;
    el.appendChild(myel);    
    //tag dropdown
    let taglbl = document.createElement("label");
    taglbl.innerText = "Tag:";
    let tagdd = document.createElement("select");
    tagdd.addEventListener("change" , function(evt){
        let mt = this.options[this.selectedIndex].value;
        let int = myel.innerHTML;
        myel.remove();
        myel = document.createElement(mt);
        myel.innerHTML = int;
        myel.setAttribute("class" , "badge " + classes);
        myel.setAttribute("contenteditable" , true);
        el.appendChild(myel);
    });
    ["div" , "p"].forEach(function(e){
        let mp = document.createElement("option");
        mp.value = e;
        mp.label = e;
        tagdd.appendChild(mp)
        });
    
    //class input
    //datalist
    if(!document.getElementById("bled_badge_block_datalist")){
        let dl = document.createElement("datalist");
        dl.setAttribute("id" , "bled_badge_block_datalist" );
        ["warning" , "info" , "note"].forEach(function(e){
            let dop = document.createElement("option");
            dop.value = e;
            dl.appendChild(dop);
        });
        document.body.appendChild(dl);
    }
    // input
    let clbl = document.createElement("label");
    clbl.innerText = "Class:";
    clbl.style.flexGrow = 0;
    let clinp = document.createElement("input")
    clinp.type = "text";
    clinp.style.flexGrow = "1";
    clinp.setAttribute("list" , "bled_badge_block_datalist" );
    //
    clinp.addEventListener("change" , function(ev){
        classes = this.value;
        myel.setAttribute("class" , "badge " + classes);
    })
    //save
    blc.save = function(){
        return {
            "class" : classes,
            "tag" :  tagdd.options[tagdd.selectedIndex].value ,
            "text" : myel.innerHTML
        }
    }
    //
    blc.addToToolbar(templates.formRow([taglbl, tagdd , clbl , clinp]));
    return blc;

}

constructors.image = function (data, el, id, editor) {
    let figtag = document.createElement("figure");
    let pimg = document.createElement("img");
    pimg.style.maxWidth = "100%";
    let fc = document.createElement("figcaption");
    fc.setAttribute("contenteditable", true);
    fc.innerHTML = data && data.caption ? data.caption : "";
    figtag.appendChild(pimg);
    figtag.appendChild(fc);
    pimg.src = data && data.file ? data.file.url : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMCkiPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjI5OSIgaGVpZ2h0PSIxOTkiIGZpbGw9IiNDNEM0QzQiIHN0cm9rZT0iYmxhY2siLz4KPGxpbmUgeTE9Ii0wLjUiIHgyPSIzNDkuNTY5IiB5Mj0iLTAuNSIgdHJhbnNmb3JtPSJtYXRyaXgoMC44NTgxOTkgLTAuNTEzMzE3IDAuODU3MjU3IDAuNTE0ODg4IDAgMTgwKSIgc3Ryb2tlPSIjNkY2RjZGIi8+CjxsaW5lIHkxPSItMC41IiB4Mj0iMzQ4LjMxIiB5Mj0iLTAuNSIgdHJhbnNmb3JtPSJtYXRyaXgoMC44NTc3MjkgMC41MTQxMDIgLTAuODU3NzI5IDAuNTE0MTAyIDAgMC41NjAxODEpIiBzdHJva2U9IiM2RjZGNkYiLz4KPC9nPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjI5OSIgaGVpZ2h0PSIxNzkiIHN0cm9rZT0iIzZGNkY2RiIvPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMCI+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==";

    let blc = {
        element: el,
        render: function () {
            //console.log("render image")
        },
    }
    templates.twoPanels(blc);
    blc.addToPreview(figtag);
    //edit
    ////upload
    let upld = document.createElement("input");
    upld.type = "file";
    upld.style.flexGrow = 1;
    let upldbtn = document.createElement("input");
    upldbtn.value = "upload";
    upldbtn.type = "button"
    upldbtn.addEventListener("click", function (e) {
        editor.upload(upld.files[0])
            .then(function (r) {
                pimg.src = r.file.url;
                srcinput.value = r.file.url;
            })
    });

    blc.addToEditor(templates.formRow([upld, upldbtn]));
    ////edit src
    let srclabel = document.createElement("label");
    srclabel.innerHTML = "Source URL";
    let srcinput = document.createElement("input");
    srcinput.style.flexGrow = 2;
    srcinput.type = "text";
    srcinput.value = data && data.file.url ? data.file.url : "";
    srcinput.addEventListener("keyup", function (e) {
        pimg.src = this.value;
    })
    blc.addToEditor(templates.formRow([srclabel, srcinput]));
    //link to
    let linklabel = document.createElement("label");
    linklabel.innerHTML = "Link to";
    let linkinput = document.createElement("input");
    linkinput.type = "text";
    linkinput.value = data && data.link ? data.link : "";
    blc.addToEditor(templates.formRow([linklabel, linkinput]))
    ////classes
    //////stretched
    let stretchlabel = document.createElement("label");
    stretchlabel.innerHTML = "stretched"
    let stretched = document.createElement("input");
    stretched.type = "checkbox";
    // stretched.classList.add("form-check-input");
    stretched.onclick = function () {
        if (this.checked) {
            right.checked = false;
            left.checked = false;
            noresize.checked = false;
        } else {
            figtag.classList.remove("stretched");
        }
    }
    stretched.checked = data && data.stretched;
    //////noresize
    let nrlabel = document.createElement("label");
    nrlabel.innerHTML = "no resize"
    let noresize = document.createElement("input");
    noresize.type = "checkbox";
    //noresize.classList.add("form-check-input");
    noresize.onclick = function () {
        if (this.checked) {
            stretched.checked = false
        }
    };
    noresize.checked = data && (data.noresize || data.withbackground);
    /////left
    let llabel = document.createElement("label");
    llabel.innerHTML = "left"
    let left = document.createElement("input");
    left.type = "checkbox";
    left.onclick = function () {
        if (this.checked) {
            right.checked = false;
            stretched.checked = false
        }
    };
    left.checked = data && data.left;
    ////right
    let rlabel = document.createElement("label");
    rlabel.innerHTML = "right"
    let right = document.createElement("input");
    right.type = "checkbox";
    right.onclick = function () {
        if (this.checked) {
            left.checked = false;
            stretched.checked = false
        }
    }
    right.checked = data && data.right;

    ////border
    let blabel = document.createElement("label");
    blabel.innerHTML = "border"
    let border = document.createElement("input");
    border.type = "checkbox";
    border.onclick = function () {
        if (this.checked) {
            pimg.classList.add("bordered")
        } else {
            pimg.classList.remove("bordered")
        }
    }
    border.checked = data && data.border;

    blc.addToEditor(templates.formRow([stretched, stretchlabel,
        noresize, nrlabel,
        left, llabel,
        right, rlabel,
        border, blabel
    ]));

    //
    blc.save = function () {
        return {
            stretched: stretched.checked,
            right: right.checked,
            left: left.checked,
            noresize: noresize.checked,
            withBackground: noresize.checked,
            border: border.checked,
            withBorder: border.checked,
            caption: fc.innerHTML,
            link: linkinput.value,
            file: {
                url: srcinput.value
            }
        }
    }
    if (data && data.file && data.file.url) {
        blc.goPreviewMode();
    } else {
        blc.goEditMode();
    }
    //
    return blc;
}

constructors.video = function (data, el, id, editor) {
    //console.log(data);
    let blc = {
        element: el,
        id: id,
        data: data ? data : {
            file: {
                url: null
            }
        },
        render: function () { },
    }
    if (!blc.data.file) {
        blc.data.file = {};
    }
    templates.twoPanels(blc);
    //preview
    let vtag = blc.addToPreview(document.createElement("video"));
    vtag.style.maxWidth = "100%";
    //let srctag = document.createElement("source");
    //vtag.appendChild(srctag);
    vtag.src = data && data.file.url ? data.file.url : "";
    //editor
    ////upload     
    let upld = document.createElement("input");
    upld.type = "file";
    upld.style.flexGrow = 1;
    let upldbtn = document.createElement("input");
    upldbtn.value = "upload";
    upldbtn.type = "button"
    upldbtn.addEventListener("click", function (e) {
        editor.upload(upld.files[0])
            .then(function (r) {
                vtag.src = r.file.url;
                srcinput.value = r.file.url;
                blc.data.file.url = r.file.url;
            })
    });
    let vhd = document.createElement("h5");
    vhd.innerText = "Video";
    blc.addToEditor(vhd);
    blc.addToEditor(templates.formRow([upld, upldbtn]));
    ////edit src
    let srclabel = document.createElement("label");
    srclabel.innerHTML = "Source URL";
    let srcinput = document.createElement("input");
    srcinput.style.flexGrow = 2;
    srcinput.type = "text";
    srcinput.value = data && data.file.url ? data.file.url : "";
    srcinput.addEventListener("keyup", function (e) {
        vtag.src = this.value;
        blc.data.file.url = this.value;
    })
    blc.addToEditor(templates.formRow([srclabel, srcinput]));
    ////params
    let params = [{
        name: "autoplay",
        checked: data && data.autoplay,
        label: "autoplay"
    },
    {
        name: "controls",
        checked: data && data.controls,
    },
    {
        name: "loop",
        checked: data && data.loop,
    },
    {
        name: "muted",
        checked: data && data.muted,
    },

    ]
    let pels = [];
    params.forEach(function (e) {
        if (!blc.data[e.name]) {
            blc.data[e.name] = false;
        }
        let plabel = document.createElement("label");
        plabel.style.flexGrow = 1;
        plabel.innerHTML = e.name;
        let pcheck = document.createElement("input");
        pcheck.type = "checkbox";
        pcheck.checked = data && data[e.name];
        pcheck.onclick = function (ev) {
            console.log(e, blc.data, e.name);
            blc.data[e.name] = this.checked;
            vtag.setAttribute(e.name, this.checked);
        };
        pels.push(pcheck);
        pels.push(plabel);


    });
    blc.addToEditor(templates.formRow(pels));

    let phd = document.createElement("h5")
    phd.innerText = "Poster"
    blc.addToEditor(phd);
    //poster upload
    let upldp = document.createElement("input");
    upldp.type = "file";
    upldp.style.flexGrow = 1;
    let pupldbtn = document.createElement("input");
    pupldbtn.value = "upload";
    pupldbtn.type = "button"
    pupldbtn.addEventListener("click", function (e) {
        editor.upload(upldp.files[0])
            .then(function (r) {
                vtag.poster = r.file.url;
                psrcinput.value = r.file.url;
                blc.data.poster = r.file.url;
            })
    });

    blc.addToEditor(templates.formRow([upldp, pupldbtn]))
    //poster src input
    ////edit src
    let psrclabel = document.createElement("label");
    psrclabel.innerHTML = "Source URL";
    let psrcinput = document.createElement("input");
    psrcinput.style.flexGrow = 2;
    psrcinput.type = "text";
    psrcinput.value = data && data.poster ? data.poster : "";
    psrcinput.addEventListener("keyup", function (e) {
        vtag.poster = this.value;
        blc.data.poster = this.value;
    })
    blc.addToEditor(templates.formRow([psrclabel, psrcinput]))
    //
    blc.save = function () {
        return blc.data;
    }
    if (!(data && data.file && data.file.url)) {
        blc.goEditMode();
    }

    return blc;
}


constructors.list = function (data, el, id, editor) {
    let blc = {
        element: el,
        list_element: null,
        type: data && data.style && data.style == "ordered" ? "ol" : "ul",
        render: function () { },
        save: function () {
            return {
                "class": (data&&data.class) || "",
                "style": blc.type == "ol" ? "ordered" : "unordered",
                "items": Array.from(this.list_element.querySelectorAll("li")).map(e => e.innerHTML)
            }
        }

    }
    //editor
    ////outer list
    blc.list_element = document.createElement(blc.type);
    el.appendChild(blc.list_element);
    ////do we have data
    if (data && data.items) {
        data.items.forEach(function (e) {
            let l = document.createElement("li");
            l.innerHTML = e;
            l.setAttribute("contenteditable", true);
            addSmartRemove(l)
            blc.list_element.appendChild(l);
        })
    }
    /////make LI deletable 
    function addSmartRemove(el) {
        el.addEventListener("keydown", function (e) {
            //console.log(e.keyCode , this.innerHTML.length);
            if (e.keyCode == 8 && this.innerHTML.replace(/\<[^>]*>/gi , "").length == 0) {
                this.remove();
            }
            if (e.keyCode == 13 && this.innerHTML.length > 0) {
                e.preventDefault();
                let ni = document.createElement("li");
                ni.setAttribute("contenteditable", true);
                //where?
                let mynext = this.nextSibling;
                if (mynext) {
                    blc.list_element.insertBefore(ni, mynext);
                } else {
                    blc.list_element.appendChild(ni); //at...?
                }
                addSmartRemove(ni);
                ni.focus();
                return;
            }
        })
    }
    /////changle list type to
    function setType(tn) {

        let ne = document.createElement(tn);
        let liss = Array.from(blc.list_element.childNodes);
        liss.forEach(e => {
            ne.appendChild(e)
        });
        blc.list_element.remove();
        blc.list_element = ne;
        blc.type = tn;
        el.appendChild(ne);
    }
    ////
    templates.addToolbar(blc);
    //radiobuttons
    //
    let rbtns = [{
        value: "ul",
        label: "Unordered"

    },
    {
        value: "ol",
        label: "Ordered"
    }
    ];
    rbtns.forEach(function (e) {
        let radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "list_buttons_" + id;
        radio.value = e.value;
        radio.checked = (blc.type == e.value);
        radio.onchange = ev => setType(e.value);
        let lbl = document.createElement("label");
        lbl.innerHTML = e.label;
        blc.addToToolbar(lbl);
        blc.addToToolbar(radio);
        
    });
    //divider
    blc.addToToolbar(document.createElement("hr"));
 
    /// add input for class
    ///--label
    let class_label = document.createElement("label");
    class_label.innerHTML = "List class:"
    let list_class = document.createElement("input");
    list_class.type = "text";
    list_class.value = (data&&data.class) || "";
    list_class.addEventListener("change" , function(){
        data.class = this.value;
    });
    blc.addToToolbar(class_label);
    blc.addToToolbar(list_class);
   //// add button ADD
   let add_b = document.createElement("input");
   add_b.type = "button";
   add_b.value = "+item";
   add_b.dataset.hint = "Add new list item";
   add_b.addEventListener("click", function () {
       let newli = document.createElement("li");
       newli.setAttribute("contenteditable", true);
       addSmartRemove(newli);
       blc.list_element.appendChild(newli);
   })
   blc.addToToolbar(add_b);
    //
    return blc;
}

constructors.audio = function (data, el, id, editor) {
    let blc = {
        element: el,
        id: id,
        data: data ? data : {
            controls: true,
            file: {
                url: null
            }
        },
        render: function () { },
        save: function () { return this.data }
    }
    templates.twoPanels(blc);
    let audiopreview = document.createElement("audio");
    audiopreview.setAttribute("src", blc.data.file.url);
    audiopreview.setAttribute("controls", true);
    audiopreview.style.width = "100%";
    blc.addToPreview(audiopreview);
    //attributes
    let ats = ["loop", "muted", "autoplay", "controls", "preload"];
    let atstags = [];
    ats.forEach(function (e) {
        //checkbox
        let chb = document.createElement("input")
        chb.type = "checkbox"
        //cnb.classList.add("form-check-input");
        chb.checked = blc.data[e] || false;
        chb.addEventListener("click", function (evt) {
            blc.data[e] = this.checked;
            if (this.checked && e != "controls") {
                audiopreview.setAttribute(e, e);
            } else if (e != "controls") {
                audiopreview.removeAttribute(e);
            }
            ;
        })
        //label
        let lb = document.createElement("label")
        lb.innerText = e;
        atstags.push(chb);
        atstags.push(lb)
    });
    //flatten

    //ats.forEach()
    //src row
    let audiosrc = document.createElement("input");
    audiosrc.type = "text";
    audiosrc.style.flexGrow = 2;
    audiosrc.value = blc.data.file.url || "";
    audiosrc.addEventListener("keyup", function () {
        audiopreview.src = audiosrc.value;
        blc.data.file.url = audiosrc.value;
    });

    let asrclabel = document.createElement("label");
    asrclabel.innerHTML = "Source:"

    //upload row
    let audioupload = document.createElement("input");
    audioupload.setAttribute("type", "file");
    audioupload.style.flexGrow = 2;
    let audiouploadbutton = document.createElement("input");
    audiouploadbutton.setAttribute("type", "button");
    audiouploadbutton.setAttribute("value", "upload");
    audiouploadbutton.addEventListener("click", function (e) {
        editor.upload(audioupload.files[0])
            .then(function (r) {
                audiopreview.src = r.file.url;
                audiosrc.value = r.file.url;
                blc.data.file.url = r.file.url;
            })
    });
    //add rows
    blc.addToEditor(templates.formRow([audioupload, audiouploadbutton]));
    blc.addToEditor(templates.formRow([asrclabel, audiosrc]));
    blc.addToEditor(templates.formRow(atstags));
    //
    if (!(data && data.file && data.file.url)) {
        blc.goEditMode();
    }

    return blc;


}