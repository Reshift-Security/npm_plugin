// function runAudit(callback) {
//     var spawn  = require('child_process').spawn;
//     var npm    = spawn('npm', ['audit']);
//     var result = '';
//     npm.stdout.on('data', function (data) {
//         result += data.toString('utf8');
//     });
//     npm.stderr.on('err', function(err){
//         console.log(err)
//     });
//     npm.on('close', function(code){
//         return(result)
//     });
//   };


function systemSync(cmd) {
    child_process = require('child_process');
    try {
      return child_process.execSync(cmd).toString();
    }
    catch (error) {
      error.status;  // Might be 127 in your example.
      error.message; // Holds the message you typically want.
      error.stderr;  // Holds the stderr output. Use `.toString()`.
      error.stdout;  // Holds the stdout output. Use `.toString()`.
      // console.log(error.message)
    }
};

function runAudit(){
    var data = systemSync('ls');
    if (data.includes('package.json')) {
        if (! data.includes('package-lock.json')){
            console.log('INFO - Creating locks for dependency checker.')
            systemSync('npm i --package-lock-only')
        }
        return systemSync('npm audit')
    }
    else{
        console.log('INFO - Unable to locate base package information, are you sure package.json included?')
        return null
    }
};

var data = runAudit();
console.log(data)