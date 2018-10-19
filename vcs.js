var Common = require('./common.js');

/*
    STDOUTSTR = newType('STDOUTSTR', string)
    description : function to create linux command call and return the stadout as string.
    requires    : cmd - string
    returns     :  Optional[STDOUTSTR]
*/
module.exports = {
    get_hash: function() {
        var git_hash = Common.systemSync('git rev-parse HEAD');
        return git_hash;
    }
};



