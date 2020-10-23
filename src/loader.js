
import * as Preview from "./preview";
import * as Producer from "./producer";
//import *  as d3 from "d3";
//const d3 = Object.assign({}, require("d3-selection"));
console.log("%cLatid " + VERSION , "font-weight:bold;color:#00A1AB;font-size: 1.2em;");

window.l4 = {
    test: ()=>console.log("TEST window.l4")
}


let pb = document.getElementById("progressbar");
pb.style.width = "40%";
pb.style.margin = "1em auto";
pb.style.padding = "0px";
pb.style.border = "1px solid white";
pb.style.height = "5px";

let pb_pr = document.createElement("div");
pb_pr.style.backgroundColor = "#ffffff";
pb_pr.style.width="1%";
pb_pr.style.height = "5px";


pb.appendChild(pb_pr);
//console.log(pb.innerHTML);
var totalloaded = 0;

window.l4.producer = new Producer.producer();
window.l4.producer.registerCallback("loadAll" , function(ms){
    //totalloaded +=10;
    let totalpc = parseInt((ms.data.number/ms.data.of)*100);
    //totalpc = totalpc > 100 ? 100 : totalpc ;
    pb_pr.style.width = totalpc + "%";
    //console.log(totalloaded , ms.data.of , totalpc);
    //console.log(pb.innerHTML);

});

//debugger();

window.l4.producer.init()
.then(function(r){
    console.log('Init');
    //check if there is an adress in adress bar
    let loc = window.location.hash && window.location.hash.startsWith("#!") ? window.location.hash.substring(2) : "/index.html" ;
    
    document.getElementById("preloader").remove();
    console.log('Preloader removed');
    let preview = new Preview.preview();
    preview.init()
    .then(()=>preview.goTo(loc))
    ;
  

});









