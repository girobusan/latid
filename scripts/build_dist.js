const fs = require('fs');
const fse = require('fs-extra');
const {exec} = require('child_process');
const ncp = require('ncp').ncp;

//check dist dir
if(fs.existsSync('dist')){
console.log("Distribution folder found");
fs.rmdirSync('dist' , {recursive:true});

}
//create new
fs.mkdirSync('dist');
function runCommand(c){
  exec(c , (err,stdout,stderr)=>
  {
    if(err){
      console.log("Error build" , err);
      return;
    }
    console.log(stdout);
    console.log(stderr);

  })
}

runCommand('npm run build');
runCommand('npm run build_cli');

//drop the dropins
//list the dropins
fse.copySync('dropins/dist/' , 'dist');
