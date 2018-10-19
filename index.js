#!/user/bin/node
var Common = require('./common.js');
var Vcs    = require('./vcs.js')


const [,, ...args] = process.argv


/*
    AUDITSTR = newType('AUDITSTR', string)
    description : function to execute 'npm audit' if 'package.json' in the dir.
    requires    : None
    return:     : Optional[AUDITSTR]
*/
function runAudit(){
    var data = Common.systemSync('ls');
    if (data.includes('package.json')) {
        // if lock not in the package, we need to create one.
        if (! data.includes('package-lock.json')){
            console.log('INFO - Creating locks for dependency checker.')
            Common.systemSync('npm i --package-lock-only')
        }
        return Common.systemSync('npm audit --json')
    }
    else{
        console.log('INFO - Unable to locate base package information, are you sure package.json included?')
        return null
    }
};


function processResult(data){
    var raw_data = JSON.parse(data)

    var git_hash = Vcs.get_hash()

    console.log(git_hash);

    return data;
}


function sendResult(token, result){

}


/*
    TOKEN = newType('TOKEN', string)
    CAPNP = newType('CAPNP', bytes)
    description : main function to run audit, process result and possibly send to server.
    requires    : token  - TOKEN,
                  isSend - Optional[bool]
    return:     : Optional[CAPNP]
*/
function main(token, isSend = true){
    var data = runAudit();

    // if (data == null){
    //     console.log('INFO - System exit since no project found.');
    //     return null;
    // };

    result = processResult(data);

    if (isSend == true){
        sendResult(token, result)
        return null;
    }
    else return result;
};


main(null, false);
// console.log(data)
return process.exit(1);