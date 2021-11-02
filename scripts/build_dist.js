const fs = require('fs');
const fse = require('fs-extra');
const {execSync} = require('child_process');
const ncp = require('ncp').ncp;
const pkg = JSON.parse(fs.readFileSync('./package.json' , {encoding: "utf8"}))
console.log("Building version" , pkg.version)

//check dist dir
if(fs.existsSync('dist')){
console.log("Distribution folder found");
fs.rmdirSync('dist' , {recursive:true});

}
//create new
fs.mkdirSync('dist');
function runCommand(c){
  console.log("Command:", c);
  execSync(c , (err,stdout,stderr)=>
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
console.log("Filling distribution folder...")
fse.copySync('dropins/dist/' , 'dist');
fse.copySync('dist' , 'latid-' + pkg.version);
console.log("All done.")
