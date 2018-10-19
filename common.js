
/*
    STDOUTSTR = newType('STDOUTSTR', string)
    description : function to create linux command call and return the stadout as string.
    requires    : cmd - string
    returns     :  Optional[STDOUTSTR]
*/
module.exports = {
    systemSync: function(cmd) {
        child_process = require('child_process');
        try {
            return child_process.execSync(cmd).toString();
        }
        catch (error) {
            error.status;  // Might be 127 in your example.
            error.message; // Holds the message you typically want.
            error.stderr;  // Holds the stderr output. Use `.toString()`.
            error.stdout;  // Holds the stdout output. Use `.toString()`.
            return null
         }
    }
};