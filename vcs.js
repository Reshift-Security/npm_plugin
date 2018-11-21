const Common   = require('./common.js');


let reg_exp  = /([0-9A-Fa-f]*)\s+\((.*)\s+(\d+)\)/
let name_exp = /(.*)\s+([0-9\:\s\-]{19})\s((\+|\-)\d{4})/

module.exports = {
    /*
        HASHSTR    := newType('HASHSTR', str)
        description : function to get vcs hash
        requires    : None
        returns     : Optional[HASHSTR]
    */
    getHash: function(root_path) {
        try{
            var git_hash = Common.systemSync('git rev-parse HEAD', root_path);
            return git_hash;
        }
        catch(error){
            console.error(error)
            return null
        }
    },


    /*
        description : function to get git url
        requires    : None
        returns     : Optional[str]
    */
    getURL: function(root_path) {
        try{
            var git_url = Common.systemSync('git config --get remote.origin.url', root_path);
            return git_url;
        }
        catch(error){
            console.error(error)
            return null
        }
    },



     /*
        description : function to get project name
        requires    : None
        returns     : Optional[str]
    */
    getProject: function(root_path) {
        try{
            var project_name = Common.systemSync('basename \`git rev-parse --show-toplevel\`', root_path);
            return project_name;
        }
        catch(error){
            console.error(error)
            return null
        }
    },


     /*
        description : function to get blm infouse regex in javascrip
        requires    : root_path -> str
        returns     : Optional[str]
    */
    getBlame: function(root_path, root_json) {
        try{
            var blame_info = {}
            blame_info['package_json'] = Common.systemSync('git blame -l ' + root_path + '/package.json', root_path);
            Object.keys(root_json).forEach(path =>{
                root_json[path].forEach( file => {
                    blame_info[path + file] = Common.systemSync('git blame -l ' + path + file, root_path);
                });
            });
            return blame_info;
        }
        catch(error){
            console.error(error)
            return null
        }
    },


    genBlame: function(line_info){
        var blame     = {}
        var line_list = reg_exp.exec(line_info);
        if(!line_list){ return null; }
        blame['hash'] = line_list[1];
        blame['line'] = line_list[3];
        var name_list = name_exp.exec(line_list[2]);
        if(!name_list){ return null; }
        blame['name'] = name_list[1].trim();
        blame['time'] = name_list[2] + ' ' + name_list[3]
        return blame;
    },


    /*
        DEPNAME    := newType('DEPNAME', str)
        BLMINFO    := newType('BLMINFO', str)
        description : function to get blm info
        requires    : raw_blame -> Optional[str],
                      dep_list  -> Optional[Sequence[str]]
        returns     : Optional[Dict[DEPNAME, BLMINFO]]
    */
    parseBlm: function(raw_blame, dep_list){

        if ((raw_blame == null) || (dep_list == null)) return null;

        var dep_list = Object.keys(dep_list);
        var blm_list = raw_blame['package_json'].split('\n');
        var result   = {};
        var i = 0;

        for(var line in blm_list){
            if (blm_list[line].includes(dep_list[i])){
                result[dep_list[i]] = this.genBlame(blm_list[line]);
                i++;
            }
        }

        return result
    }
};



