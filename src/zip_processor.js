import * as Production from "./production";
var JSZip = require("jszip");

//Experimental
//zip loader

//init
//load binary | ArrayBuffer
//create fileops
//run production
//???
//PROFIT
function createFileOps(zipfile){

/*
{
    0 get:       f(p),      //async ~
    0 write:     f(p,c)     //async ~
    0 writeSync: f(p , c),  //sync  *
    0 copy:      f(from,to) //async ~
    0 getSync:   f(p),      //sync  *
    0 list:      f(p),      //async ~ ?
    0 base:      string     //base href for views, specific for loader
}
*/
  return new function(){
  
   this.base = "";

   this.get = function(p){
   console.log("zip get" , p)
   //return zipfile.file(p).async("arraybuffer");
   return this.getSync(p);
   };

   this.getSync = function(p){
   console.log("zip get sync" , p);
   console.log("look:" , zipfile.file(p));
   let zfs =  zipfile.file(p).internalStream("arraybuffer")
   let data = new Uint8Array();
   let ready = false;
   let steps = 10000;
   zfs.on("data" , (d)=>{
     console.log("data" , d)
     data = data.concat(d);
     ready = true;
   });
   zfs.on("end"  , (d)=>{console.log("end" , steps);ready=true});
   zfs.on("error" ,(d) => {console.error(d);ready=true})
   zfs.resume();
   console.log(zfs);

   while(!ready ){
     steps = steps-1;
     console.log( "read....");
   }
   console.log("result" , data.buffer);
   return data.buffer ; 

   };

   this.writeSync = function(p,c){ 
     console.log("zip write sync" , p);
     zipfile.file(p,c , {binary:true});
     return {status: "success"};
   }

   this.write = async function(p,c){ 
    console.log("zip write" , p);
     zipfile.file(p,c , {binary:true});
     return {status: "success"};
   }

   this.copy = async function(p1,p2){
     console.log("zip copy" , p1 , p2);
     zipfile.file(p2 , zipfile.file(p1).async("arraybuffer") , {binary:true})
     return {status: "success"};
   }

   this.list = async function(p){
     console.log("zip list" , p);
     let rxp = p ? new RegExp( "^"+p , "g" ) : /./g ;
     let lst = [];
     zipfile.forEach(function(p,f){
       if(!f.dir && rxp.match(p)){
         lst.push({"path": p ,
           "mtime" : f.date,
           "mtimeMs" : (new Date(f.date)).getTime()
         })
       }
     });

     return  lst;

     
   }

   //end of fileops
  }


}
//zip => zip'
export function generate(zf , msgf){
  const zipsite = new JSZip();
  
  zipsite.loadAsync(zf)
  .then(function(){
     
     console.log("zip file!");
//     zipsite.forEach(function(p,f){
//       console.log(p);
//     });
     //start generation
     let prod = new Production.routines(createFileOps(zipsite));
     prod.init( ()=> prod.generateAll() );
     //save file
     //end generation

  })
  .catch(function(err){
    console.error(err);
    msgf("Wrong file");
  })
     
}

export function buildDropzone(){
  let dz = document.createElement("div");
  let dzl = document.createElement("div");
  dzl.innerHTML = "Emergency dropzone (not&nbsp;implemented)";
  dzl.style.pointerEvents = "none";
  dzl.style.opacity = .3;
  dz.appendChild(dzl)
  dz.style.width = "100px";
  dz.style.height = "100px";
  dz.style.backgroundColor = "rgba(255,255,255,.3)";
  dz.style.borderRadius = "4px";
  dz.style.margin = "2rem auto";
  dz.style.padding = "1rem";
  dz.style.color="rgba(255,255,266,1)";
  dz.style.fontSize = "13px";
  dz.style.display = "flex";
  dz.style.flexDirection = "column";
  dz.style.justifyContent = "center";

  dz.addEventListener("dragenter", function(e){
  dzl.style.opacity = 1;
    e.preventDefault();
    e.stopPropagation();
  });

  dz.addEventListener("dragover", function(e){
    e.preventDefault();
    e.stopPropagation();
  });

  dz.addEventListener("dragleave", function(e){
  dzl.style.opacity = .3;
    e.preventDefault();
    e.stopPropagation();
  });

  dz.addEventListener("drop", function(e){
  dzl.style.opacity = .3;
    e.dataTransfer.files[0].arrayBuffer() //.arrayBuffer()
    .then(function(r){
      console.log("Zip loaded..." );
      generate(r , m=>dzl.innerText=m);
    })
    e.preventDefault();
    e.stopPropagation();
  })


  return dz;

}
