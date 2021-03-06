//Themes support
//
//return function(dir , dir2 , ... template name)=> full path to template
export function templatePath(settings){
  const default_path = '/_config/templates';
  var current_path;

  if(settings && settings.themes 
    && settings.themes.enabled 
  && settings.themes.theme){
    console.info("Theme set:" , settings.themes.theme);
    current_path =  "/_config/themes/" + settings.themes.theme + "/templates"
  }else{
  console.info("Theme not set");

    current_path =  default_path;
  }

  return function(...p){
    //console.log("Looking for" , p.join("/"));
    return current_path + "/" +  p.join("/");
  }
}
