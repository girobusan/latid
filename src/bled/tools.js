import * as UI from "./ui";
const d3 = Object.assign({}, require("d3-selection"));

export var templates = {}

templates.formRow = function (elements_array , hint) {
    let row = document.createElement("div");
    row.classList.add("formrow");
    //row.classList.add("bootstrap");
    //row.style.display = "flex";
    //row.style.marginBottom = "8px";
    elements_array.forEach(function (e, i) {
        if (i > 0) {
            //console.log(e);
            e.style.marginLeft = "8px";
        }
        //if (e.nodeName == "LABEL" && i != 0) {
            //e.classList.add("form-check-label")
        //    e.style.flexGrow = 1;
        //}
        row.appendChild(e);
    });
    if(hint){
        row.dataset.hint = hint;
    }
    return row;
}

templates.addToolbar = function (block) {
    let tbx = document.createElement("div");
    //tbx.classList.add("bootstrap");
    tbx.classList.add("block_toolbar");
    tbx.classList.add("uistyle")
    tbx.classList.add("uicontainer")
    tbx.classList.add("formrow")
    //tbx.style.backgroundColor = UI.Colours.pale;
    //tbx.style.color = "black";
    //tbx.style.minHeight = "24px";
    //tbx.style.fontSize = ".8em"
   // tbx.style.display = "flex";
    //tbx.style.padding = "4px";
    //tbx.style.background = "linear-gradient(0deg, rgba(0,0,0,0) 50%, rgba(62,217,227,0.5) 100%)"  ; 

    block.element.parentNode.appendChild(tbx); //add to editor_item, !not! block content container
    block.addToToolbar = function (el) {
        //if (el.tagName == "LABEL") {
        //    el.style.flexGrow = 1;
        //}
        tbx.appendChild(el)
    }
}

templates.twoPanels = function (block) {
    //let mode = "preview";
    let pp = document.createElement("div");
    pp.classList.add("block_preview_panel");
    pp.classList.add("one_of_two_panels");
    //pp.style.all = "initial";
    pp.style.position = "relative";
    pp.style.minHeight = "64px";
    pp.style.width = "100%";

    let ep = document.createElement("div");
    ep.classList.add("block_edit_panel");
    ep.classList.add("one_of_two_panels");
    ep.classList.add("uistyle");
    ep.classList.add("uicontainer");
    //ep.style.minHeight = "64px";
    ep.style.backgroundColor = UI.Colours.pale;
    //ep.style.color = "#444";
    //ep.style.backgroundColor = "silver";
    ep.style.paddingTop = "8px";// + UI.mycyan;
    ep.style.display = "none";
    //ep.style.padding = "8px 8px 16px 8px";
    
    //
    let ebtn = document.createElement("div");
    //ebtn.classList.add("edit_button");
    //ebtn.innerHTML = "Show editor";
    ebtn.style.all = "initial";
    ebtn.style.position = "absolute";
    ebtn.style.backgroundColor = UI.Colours.dark;
    ebtn.style.padding = "12px";
    ebtn.style.color = "white";
    ebtn.style.fill = "white";
    ebtn.style.width ="32px";
    ebtn.style.height ="32px";
    ebtn.style.borderRadius = "32px";
    ebtn.style.zIndex = 5;
    ebtn.style.right = "8px";
    ebtn.style.bottom = "0px";
    ebtn.style.cursor = "pointer";
    ebtn.dataset.hint = "Toggle settings";
    ebtn.style.opacity = .6;
    ebtn.innerHTML = UI.icons.material.tune;
    let es = ebtn.querySelector("svg");
    es.style.pointerEvents = "none";

    ebtn.addEventListener("mouseover" , e=>ebtn.style.opacity=1);
    ebtn.addEventListener("mouseout" , e => ebtn.style.opacity=.6);

    ebtn.addEventListener("click", function () {
        let editmode = ep.style.display != "none";
        
        if (editmode) {
            ep.style.display = "none";
            //ebtn.innerHTML = "Show editor";
        } else {
            ep.style.display = "block";
            
        }
    })
    //
    pp.appendChild(ebtn);
    //
    console.log(block)
    block.element.appendChild(pp);
    block.element.appendChild(ep);
    //
    block.addToPreview = function (e) {
        pp.appendChild(e);
        return e;
    }
    block.addToEditor = function (e) {
        ep.appendChild(e);
        return e;
    }
    block.goEditMode = function (e) {
        ep.style.display = "block";
        //ebtn.innerHTML = "Hide editor";

    }
    block.goPreviewMode = function (e) {
        ep.style.display = "none";
        //ebtn.innerHTML = "Show editor";

    }
    block.isInEditMode = function () {
        return (ep.style.display != "none");
    }

}