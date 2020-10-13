import * as Linkops from "./linkops";
import * as Listops from "./listops";
import * as Util from "./util";

const linkre = /(<[^>!]*)(href|src|poster)(\s*=\s*)("|')\s*(\/.+?)\4/gi; //g5 = link g4 = ";
const slashplusre = /\/\+([^:]+):(.+)/;
const linktagre = /(<[^>!]*)(href|src|poster)[^>!]+\>/gi;
const paramre = /(href|src|poster)(\s*=\s*)("|')\s*(\/.+?)\3/gi; //g4 = href

export function rewriter(views) {
    var my = this;
    my.lister = new Listops.lister(views)


    function parsePlus(ur) {
        //console.log('pp' , ur)
        var prs = ur.match(slashplusre);
        if (prs != null) {
            //console.log(ur , ":" , me.core.pool.findFileBy(prs[1], prs[2]).title);  
            let fileo = my.lister.getByField(prs[1], prs[2])
            return fileo ? fileo.uri : ur;
        } else if (ur.startsWith("/")){
            return ur;
        
        } else {
            return ur; //my.lister.getByField("uri" , ur);
        }
    }


    //universal replacer creator
    function createReplacer(from, basehref) { //from = out_path входящего файла
        //console.log("FROM" , from);
        //if(!absolute){console.log('RELATIVE FCUK')}
        return function (match) {
            //console.log(match.group(0))         
            let ntag = match.replace(paramre , function(m , g1 , g2 , g3 , g4){
                //g4 = uri
                let maybe = parsePlus(g4) || m;
                let rel = g4;
                if (!basehref ) {
                    
                    rel = Linkops.getRelativeURI(from , maybe);//.uri);                 
                }else{
                    rel = Util.gluePath( basehref , maybe);
                }
                return g1+g2+g3+rel+g3;
            });
            return ntag;           
        }//replacer
    }

    this.rewriteAllLinks = function(txt , from , basehref){
        //console.log(txt , from)
        return txt.replace(linktagre, createReplacer(from, basehref));
    }

    this.removeSelfLinks = function(t, p) {       
        var srg = /<a\s+href\s*=\s*("|')(.+?)\s*\1[^>]*>(.+?)<\/a>/ig;  
        var tt = t.replace(srg, function (m, g1, g2, g3) {
            return g2 == p ? '<span class="selflink">' + g3 + '</span>' : m;
        })   
        return tt; //t.replace(rg , "$3");
    }
}
