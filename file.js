const fs = require('fs'), path = require('path');


let is_git = false;

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
        return is_git;
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
            // some project might contain broken linked files
            try{
                let isDirectory = fs.statSync(dirPath).isDirectory();
                // check if this is a node_modules or .git folder
                let isDepend    = dir.includes('node_modules') || dir.includes('.git') || dir.includes('.vscode');
                if(dir.includes('.git')) { is_git = true;  }
                // any walk to none depend folder (main) and add .js file
                (isDirectory && !isDepend) ? this.walkDir(dirPath, root_json) :
                                ((this.isJS(f) && !isDepend) ? root_json[dir].push(f) : {})
            }
            catch(error){
            }
        });
        // clean empty one, we care only existing one
        if(root_json[dir].length === 0){
            delete root_json[dir]
        }
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
    },


    /*
        description : get correct root directory
        requires    : file_path -> str,
        returns     : str
    */
    correctRoot: function(file_path){
        if (file_path.includes('node_modules')){
            end_index = file_path.indexOf('node_modules');
            return file_path.slice(0, end_index);
        }
        return file_path
    },

    getDependencyList: function(package_json){
        keys = Object.keys(package_json);
        dependencies_base = keys.includes('dependencies') ? package_json.dependencies : null;
        dependencies_dev  = keys.includes('devDependencies') ? package_json.devDependencies : null;

        if (dependencies_base == null){
            return dependencies_dev;
        }
        if (dependencies_dev == null){
            return dependencies_base;
        }
        else{
            return Object.assign(dependencies_base, dependencies_dev);
        }
    }
};
