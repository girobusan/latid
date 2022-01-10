const fs = require('fs');
const fse = require('fs-extra');
const {execSync} = require('child_process');
const ncp = require('ncp').ncp;
const pkg = JSON.parse(fs.readFileSync('./package.json' , {encoding: "utf8"}))
console.log("Building version" , pkg.version)
//check if dist

const createDistFolder = process.argv.findIndex(e=>e=='--dist')!=-1;

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

runCommand('npx webpack --mode=production');
runCommand('npm run build_cli');

//drop the dropins
//list the dropins
console.log("Filling Latid folder...")
//copy docs
fse.copySync('docs/en' , 'dropins/dist/src.example/docs')
fse.copySync('dropins/dist/' , 'dist');
if(createDistFolder){
  console.log("Creating distribution folder");
  fse.copySync('dist' , 'latid-' + pkg.version);
}
console.log("All done.")
