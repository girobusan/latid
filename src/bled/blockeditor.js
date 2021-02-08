import * as UI from "./ui";
import { constructors as Coreblocks } from "./coreblocks";
import "./scss/forms.css";
export const version = "1.2.15";

export function BlockEditor({
    selector
}) {
    const my = this;
    //
    let mine = document.createElement("div");
    mine.classList.add("block_editor_outer_container");
    mine.style.minHeight = "64px";
    mine.style.width = "100%";
    let they = document.querySelector(selector);
    they.innerHTML = "";
    they.appendChild(mine);
    this.element = mine; //this element is mine


    this.editors = {
        //"zero":{
        //
        //}
    }; // null; //params.editors; //  available blocks editors
    this.blocks = null; // blocks array
    this.addMenu = [];

    var _current_id = 0;

    this._makeID = function () {
        _current_id++;
        return _current_id;
    }

    this.upload = function (f, testurl) {
        console.log("Testing upload", f);
        return new Promise(function (resolve, reject) {
            resolve({
                success: "1",
                file: {
                    url: testurl ? testurl : "kitty.jpeg"
                }

            });
        })
    }

    this.setUploadFunction = function (func) {
        this.upload = func;
        return this;
    }
    this.setBlocks = function (blocks) {
        this.blocks = {};
        mine.querySelectorAll(".block_editor_unit").forEach(e => e.remove());
        this._current_id = 1;
        if (blocks) {
            blocks.forEach(e => this.addNewBlockFromSource(e));
        }
    }

    this.hide = function () {
        this.element.remove();
    }

    this.show = function () {
        let they = document.querySelector(selector);
        they.innerHTML = "";
        they.appendChild(this.element);
        UI.tooltips();
        UI.textTools();
    }

    this.start = function (blocks) {
        //add sero block

        //this.element.innerHTML = "";
        this.blocks = {};
        //console.log(this.editors)
        //"add" menu
        Object.keys(this.editors).forEach(function (e) {

            //console.log("added handler for", e);
            let val = my.editors[e];
            my.addMenu.push({
                "label": val.label,
                "icon": val.icon ? val.icon : null,
                "handler": function (refid) {
                    my.addNewBlock(e, null, refid);
                }
            })
        })
        //Zero block

        let zero = document.createElement("div");
        zero.classList.add("starting_block");
        //zero.style.height = "8px";
        zero.style.width = "100%";
        zero.style.marginLeft = "-32px";
        zero.style.marginRight = "-32px";
        zero.style.padding = "0px 32px"
        zero.dataset.block_id = "start";
        //
        let rect = document.createElement("div");
        //rect.style.backgroundColor = UI.Colours.light;
        rect.style.color = UI.Colours.light;
        rect.innerHTML = "Edit mode";
        rect.style.padding = "0.5em 0.5em";
        rect.style.letterSpacing = ".1em";
        rect.style.fontSize = "10px";
        //rect.style.fontWeight = "bold";
        rect.style.height = "100%";
        rect.style.textAlign = "center";
        //rect.style.userSelect = "none";
        zero.appendChild(rect);
        UI.addPlusButton(zero, this.addMenu);
        mine.appendChild(zero);
        //
        this.setBlocks(blocks);
        //start UI
        UI.tooltips();
        UI.textTools();
        //UI.addCommonStyles(this.element);
    }

    this.blockByID = function (id) {
        return this.blocks[id];
    }

    this.ID2Index = function (id) {
        //
        let r = null;
        this.element.querySelectorAll(".block_editor_unit").forEach((e, i) => {
            if (e.dataset.block_id == id) {
                r = i
            }
        });
        return r;
    }

    this.Index2ID = function (idx) {
        return this.element.querySelectorAll(".block_editor_unit").item(idx).dataset.block_id;
    }

    this.blockElementByID = function (id) {
        return this.element.querySelectorAll(".block_editor_unit").item(this.ID2Index(id));
    }

    this.blockElementByIndex = function (idx) {
        return this.element.querySelectorAll(".block_editor_unit").item(idx);
    }

    this.addNewBlockFromSource = function (d) {
        this.addNewBlock(d.type, d.data, null);
    }

    this.moveUp = function (id) {
        let bindex = this.ID2Index(id);
        if (bindex == 0) {
            return false;
        }
        //find prev block
        let upper = this.blockElementByIndex(bindex - 1);
        if (upper) {
            let theblock = this.blockElementByID(id);
            this.element.insertBefore(theblock, upper);
            return true;
        } else {
            return false;
        }
    }

    this.moveDown = function (id) {
        let bindex = this.ID2Index(id);
        //last?
        if (bindex + 1 == Object.keys(this.blocks).length) {
            return false;
        }
        let nextnext = this.blockElementByIndex(bindex + 2);
        let theblock = this.blockElementByID(id);
        if (nextnext) {
            this.element.insertBefore(theblock, nextnext);
        } else {
            //we at prelast element
            this.element.appendChild(theblock);
        }
        return true;
    }

    this.registerEditor = function ({
        type,
        make,
        icon,
        label,
        paste
    }) {
        this.editors[type] = {
            make,
            icon,
            label,
            paste
        };
    }

    this.focusOn = function (id) {
        let bf = this.blockElementByID(id);
        bf.focus();
    }

    this.addNewBlock = function (type, data, refid) { //ref=instert after that block
        //if there is ref id, we have to insert after
        //find next element
        if (refid == "start") {
            // var start = true;
            var refel = this.blockElementByIndex(0);
        } else if (refid) {
            let nextidx = this.ID2Index(refid) + 1;
            var refel = this.blockElementByIndex(nextidx);
        }

        //create block of type 
        var domblock = document.createElement("div");
        var bID = this._makeID();
        var bicon = document.createElement("div");
        bicon.style.position = "absolute";
        bicon.style.width  = "16px";
        bicon.style.height = "16px";
        bicon.style.left = "8px";
        //bicon.style.opacity = ".3";
        bicon.style.fill = UI.Colours.light;
        bicon.innerHTML = this.editors[type] ?  this.editors[type].icon : UI.icons.question;
        domblock.appendChild(bicon);
        
        
        let bcontent = document.createElement("div");
        domblock.appendChild(bcontent);
        domblock.classList.add("block_editor_unit");
        domblock.dataset.block_id = bID;
        domblock.dataset.block_type = type;
        


        bcontent.classList.add("block_content_container");
        if (type in this.editors) {
            var block = this.editors[type].make(data, bcontent, bID, this); //block made
        } else {
            var block = { save: () => data, render: () => null }
            //this.blocks[bID] = block;
            console.log("no editor for", type);
            //return null;
            bcontent.classList.add("bleduistyle");
            bcontent.innerHTML = "Unknown block: <strong>" + type + "</strong>";
            bcontent.style.backgroundColor = UI.Colours.light;
            bcontent.style.color = "white";
            bcontent.style.fontSize = "2em";
            bcontent.style.textAlign = 'center';
            bcontent.style.padding = "2em 0em";
        }
        this.blocks[bID] = block;
        UI.addPlusButton(domblock, this.addMenu);
        UI.addBlockControls(domblock, null, this);

        if (refid && refel) {
            this.element.insertBefore(domblock, refel);
        } else {
            this.element.appendChild(domblock);
        }
        block.render();
        return bID;
    } //add new block

    this.removeBlock = function (id) {
        //find block index
        let elidx = this.ID2Index(id);
        //announce deletion to block
        if ("beforeDelete" in this.blocks[id]) {
            this.blocks[id].beforeDelete();
        }
        //remove dom element
        this.element.querySelectorAll(".block_editor_unit").item(elidx).remove();
        //del block from registry
        delete (this.blocks[id]);
    } //remove block

    this.save = function (clb) {
        let dt = [];
        this.element.querySelectorAll(".block_editor_unit")
            .forEach(function (e) {
                //console.log(e);
                dt.push({
                    "type": e.dataset.block_type,
                    "data": my.blocks[e.dataset.block_id].save()
                })
            });
        let ts = new Date();
        let mydata = {
            "editor": "BlEd/" + version,
            "stime": ts.toISOString(),
            "time": ts.getTime(), //legacy
            "blocks": dt
        };

        console.groupCollapsed("%cEditor saving", ("color: " + UI.mycyan));
        console.log(mydata);
        console.groupEnd();

        if (clb) {
            clb(mydata)
        };
        return mydata;
    }

}




export function makeBasicEditor(el) {
    let editor = new BlockEditor({
        selector: el
    });

    editor.registerEditor({
        type: "paragraph",
        icon: UI.icons.material.paragraph,
        make: Coreblocks.paragraph,
        label: "Paragraph"
    });
    editor.registerEditor({
        type: "divider",
        make: Coreblocks.divider,
        icon: UI.icons.divider,
        label: 'Divider'
    });
    editor.registerEditor({
        type: "header",
        icon: UI.icons.header,
        make: Coreblocks.header,
        label: 'Header'
    });
    editor.registerEditor({
        type: "code",
        icon: UI.icons.code,
        make: Coreblocks.code,
        label: 'Code snippet'
    });
    editor.registerEditor({
        type: "raw",
        icon: UI.icons.raw,
        make: Coreblocks.raw,
        label: 'Raw HTML'
    });
    editor.registerEditor({
        type: "quote",
        icon: UI.icons.material.quote,
        make: Coreblocks.blockquote,
        label: 'Blockquote'
    });
    editor.registerEditor({
        type: "image",
        icon: UI.icons.material.image,
        make: Coreblocks.image,
        label: 'Image'
    });
    editor.registerEditor({
        type: "video",
        icon: UI.icons.material.video,
        make: Coreblocks.video,
        label: 'Video'
    });
    editor.registerEditor({
        type: "list",
        icon: UI.icons.material.list,
        make: Coreblocks.list,
        label: "List",
    });
    editor.registerEditor({
        type: "audio",
        icon: UI.icons.material.audio,
        make: Coreblocks.audio,
        label: "Audio",
    });
    editor.registerEditor({
        type: "attachment",
        icon: UI.icons.material.attachment,
        make: Coreblocks.attachment,
        label: "Attach file",
    });
    editor.registerEditor({
        type: "badge",
        icon: UI.icons.material.report,
        make: Coreblocks.badge,
        label: "Badge",
    });
    editor.registerEditor({
        type: "markdown",
        icon: UI.icons.markdown,
        make: Coreblocks.markdown,
        label: "Markdown block",
    });
    //console.log(UI.icons.material.list);

    return editor;
}
//  my.current_editor = new editor_fn(l4, editor_element, my.current_view.file.content);

export function makeLatidEditor(l4, editor_element_selector, file_content) {
    let ed = makeBasicEditor(editor_element_selector);
    ed.setBlocks(file_content);
    return ed;
}
