const d3 = Object.assign({}, require("d3-selection"));

export function dumbEditor(l4, selector, contentstr) {
    var my = this;
    var d3elem = d3.select(selector);
    this.textarea = null;
    //this.current_view = view;

    this.start = function () {
        //l4.log("start editor!");
        d3elem.html("");

        //build editor interface
        //l4.debug("Content:", contentstr);
        this.textarea = d3elem.append("textarea")
            .attr("class", "dumbeditor")
            .style("width", "100%")
            //.style("border", "1px solid red")
            .style("padding", "10px")
            .style("height" , "5px")
            .style("font-size" , "16px")
            .html(contentstr)
            .attr("contenteditable", "true")         
            
            ;

        this.textarea.style("height" , this.textarea.node().scrollHeight + "px");

        

        //.attr("value" , content); 

    }

    this.save = function (cllb) {
        if (cllb) {
            console.log("Saving callback used");
            cllb(my.textarea.node().value); //:FIX!
            return
        } else {
            return my.textarea.node().value
        }
        //console.log("saved" , this.current_view)

    }
}

export function metaEditor(l4, view, refresh_func) {
    this.lines = null;
    //var refresh_func = 

    this.buildUI = function (c) {
        c.append("h4").text("metadata");
        var lines_cont = c.append("div").attr("class", "form_container");

        function addLine(d3sel, name, val) {
            var row = d3sel
                .append("div")
                .attr("class", "formrow")
                .style("display", "flex");
            //.style("align-content", "stretch");

            row.append("input").attr("class", "metaname")
                .attr("type", "text")
                .attr("contenteditable", true)
                .attr("value", name);

            row.append("input").attr("class", "metavalue")
                .attr("type", "text")
                .attr("value", val);

            row.append("div").attr("class", "pane_button_active small minus")
                .on("click", function () {
                    this.parentNode.remove();
                })
                .text("—")

            row.selectAll("input").on("change", function () {
                console.log('CHANGE');
                this.style.backgroundColor = "yellow"
            });

        }

        //existing meta
        for (var k in Object.keys(view.file.meta)) {
            var key = Object.keys(view.file.meta)[k]
            addLine(lines_cont, key, view.file.meta[key])
        }

        //add and save
        c.append("div")
            .attr("class", "pane_button_active")
            .text("reset content")
            .on("click", function () {
                //line
                lines_cont.call(addLine);

            })
            .text("add");
        c.append("div")
            .attr("class", "pane_button_active")
            .text("reset content")
            .on("click", function () {
                var d3inps = lines_cont.selectAll("input")
                var inps = d3inps.nodes();
                var vals = inps.map(e => e.value);
                var newmeta = {}
                for (var i = 0; i < vals.length; i += 2) {
                    newmeta[vals[i]] = vals[i + 1]
                }
                view.file.meta = newmeta;
                d3inps.style("background-color", "white");
                //console.log(refresh_func)
                //l4.browser.redraw();
            })
            .text("commit");
    }


}