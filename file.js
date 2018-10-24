const fs = require('fs'), path = require('path');


module.exports = {
    /*
        description : get currenct wd
        requires    : cmd - null
        returns     : str
    */
    getCWD: function() {
        return __dirname;
    },


    /*
        description : function to check if it is git
        requires    : root_json -> JSON
        returns     : bool
    */
    isGit: function(root_json){
        json_str = JSON.stringify(root_json);
        return json_str.includes('.git')
    },


    /*
        description : function to check if it is js
        requires    : file_name -> str
        returns     : bool
    */
    isJS: function(file_name){
        return file_name.endsWith('.js')
    },


    /*
        description : function to walk through base dir and collect all js file
        requires    : root_json -> JSON
        returns     : bool
    */
    walkDir: function(dir, root_json) {
        root_json[dir] = [];
        fs.readdirSync(dir).forEach( f => {
            let dirPath = path.join(dir, f);
            let isDirectory = fs.statSync(dirPath).isDirectory();
            // check if this is a node_modules or .git folder
            let isDepend    = dir.includes('node_modules') || dir.includes('.git');
            // any walk to none depend folder (main) and add .js file
            (isDirectory && !isDepend) ? this.walkDir(dirPath, root_json) :
                             ((this.isJS(f) && !isDepend) ? root_json[dir].push(f) : {})
        });
    },


    /*
        description : load base package json
        requires    : file_path -> str
        returns     : JSON
    */
    loadPackage: function(file_path){
        return JSON.parse(fs.readFileSync(file_path, 'utf8'));
    },


    /*
        description : load base package json
        requires    : file_path -> str,
                      result    -> JSON
        returns     : None
    */
    saveResult: function(file_path, result){
        fs.writeFileSync(file_path, JSON.stringify(result));
        console.log("INFO - Created temp file for created report.");
    }
};
