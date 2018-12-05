/**
 * common module used by other modules
 * @module npm_plugin/common
 */
module.exports = {
     /**
     * perform system call
     * @param  {string} cmd       - A cmd line instruction in string form
     * @param  {string} root_path - The root directory to perform the scan (default to current)
     * @return {string|null}      - return output as a string if success, null otherwise
     */
    systemSync: function(cmd, root_path) {
        child_process = require('child_process');
        try {
            return child_process.execSync(cmd,
                    {
                        cwd: root_path
                    }
                ).toString();
        }
        catch (error) {
            // HACK - stupid npm exit 1 if contains vulnerability, check stderr first
            return (error.stderr.toString().length == 0) ? error.stdout.toString() : null
         }
    },


    /**
     * generate npm version
     * @param  {string} root_path - The root directory to perform the scan (default to current)
     * @return {string|null}      - return vpm version as a string if found, null otherwise
     */
    get_npm: function(root_path){
        return this.systemSync("npm -v", root_path)
    }
};
