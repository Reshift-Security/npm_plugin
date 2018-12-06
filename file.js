const fs = require('fs'), path = require('path');


let is_git = false;


/**
 * file module deal with file accessing and processing
 * @module npm_plugin/file
 */
module.exports = {
     /**
     * find current root directory
     * @param  {null}
     * @return {string} - return current directory as a string
     */
    getCWD: function() {
        return process.cwd();
    },


     /**
     * return if current root is a valid git folder
     * @param  {null}
     * @return {bool}
     */
    isGit: function(){
        return is_git;
    },


     /**
     * determine if current file is javascript
     * @param  {string} file_name - name of a file
     * @return {bool}
     */
    isJS: function(file_name){
        return file_name.endsWith('.js')
    },


     /**
     * recursive walk through a given directory, collect all the javascript file
     * @param  {string} dir       - name of the directory
     * @param  {json}   root_json - a list of javascript files in json format
     * @return {json}   return the file listt as json
     */
    walkDir: function(dir, root_json) {
        root_json[dir + '/'] = [];
        fs.readdirSync(dir).forEach( f => {
            let dirPath = path.join(dir, f);
            // some project might contain broken linked files
            try{
                let isDirectory = fs.statSync(dirPath).isDirectory();
                // check if this is a node_modules or .git folder
                let isDepend    = dir.includes('node_modules') || dir.includes('.git') || dir.includes('.vscode') || dir.includes('doc');
                // HACK update the is_git which used in later
                if(dir.includes('.git')) { is_git = true;  }
                // any walk to none depend folder (main) and add .js file
                (isDirectory && !isDepend) ? this.walkDir(dirPath, root_json) :
                                ((this.isJS(f) && !isDepend) ? root_json[dir + '/'].push(f) : {})
            }
            catch(error){
            }
        });
        // clean empty one, we care only existing one
        if(root_json[dir + '/'].length === 0){
            delete root_json[dir + '/']
        }
    },


     /**
     * read the package json
     * @param  {string} file_path - package json file path
     * @return {json}   return the file as json
     */
    loadPackage: function(file_path){
        return JSON.parse(fs.readFileSync(file_path, 'utf8'));
    },


     /**
     * save result to a file
     * @param  {string} file_path - target file path
     * @param  {json}   result    - report result as a json
     * @return {null}
     */
    saveResult: function(file_path, result){
        fs.writeFileSync(file_path, JSON.stringify(result));
        console.log("INFO - Created temp file for created report.");
    },


     /**
     * current the root directory if it's in a node_modules
     * @param  {string} file_path - target file path
     * @return {string}
     */
    correctRoot: function(file_path){
        if (file_path.includes('node_modules')){
            end_index = file_path.indexOf('node_modules');
            return file_path.slice(0, end_index);
        }
        return file_path
    },


     /**
     * iterate the package json, extract all dependency
     * @param  {json} package_json - target file path
     * @return {json} - return all the dependency as a json
     */
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
