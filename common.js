/*
    STDOUTSTR  := newType('STDOUTSTR', string)
    description : function to create linux command call and return the stadout as string.
    requires    : cmd - string
    returns     : Optional[STDOUTSTR]
*/
module.exports = {
    systemSync: function(cmd) {
        child_process = require('child_process');
        try {
            return child_process.execSync(cmd).toString();
        }
        catch (error) {
            // HACK - stupid npm exit 1 if contains vulnerability, check stderr first
            return (error.stderr.toString().length == 0) ? error.stdout.toString() : null
         }
    }
};