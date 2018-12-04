#!/usr/bin/env node
'use strict';

const Common    = require('./common.js');
const Files     = require('./file.js');
const Transport = require('./transport.js');
const Report    = require('./report.js')

const ArgumentParser = require('argparse').ArgumentParser;


const parser = new ArgumentParser({
    version: '1.1.5',
    addHelp:true,
    description: 'NPM security plugin'
});
parser.addArgument(
    [ '-t', '--token' ],
    {
        help: 'Token used to identify report provider.'
    }
);
parser.addArgument(
    [ '-o', '--output_path' ],
    {
        help: 'Output file absolute path [optional]'
    }
);
parser.addArgument(
    [ '-p', '--port' ],
    {
        help: 'Port to be used to transport report to reshift (443 by default) [optional]'
    }
);
parser.addArgument(
    [ '-u', '--host' ],
    {
        help: 'Host to be used to transport report to (\'reshift.softwaresecured.com\' by default)  [optional]'
    }
);
const args = parser.parseArgs();


/*
    TOKEN      := newType('TOKEN', string)
    CAPNP      := newType('CAPNP', bytes)
    description : main function to run audit, process result and possibly send to server.
    requires    : token  - TOKEN,
                  isSend - Optional[bool]
    return:     : Optional[CAPNP]
*/
function getResult(token, isSend = true, host = 'reshift.softwaresecured.com', port = 443, root_path = null){
    var token      = (args['token'] != null || args['token'] != 'undefined') ? args['token']: token;
    var host       = (args['host'] != null || args['host'] != 'undefined') ? args['host']: host;
    var port       = (args['port'] != null || args['port'] != 'undefined') ? args['port']: token;
    var root_path  = (root_path != null) ? root_path : Files.correctRoot(Files.getCWD());

    if (token == null){
        console.log('INFO - System exit since no token provided.');
        console.log('INFO - Use \'-h\' argument to see help.')
        return null;
    }

    var root_json = {};
    // walk though root and get all the file name
    Files.walkDir(root_path, root_json);
    console.log("INFO - Verifying npm.")

    var npm_ver  = Common.get_npm(root_path);
    var ver_list = npm_ver.split('.')
    if ((ver_list[0] + ver_list[1]) < 51){
        console.log('INFO - System exit since npm version too low(below 5.2.0), please check your npm (local package will override global one).');
        console.log('INFO - Local npm version:' + npm_ver)
        return null;
    };

    var start   = Math.floor((new Date()).getTime() / 1000);
    console.log("INFO - Creating dependency report.")
    var data    = Report.runAudit(root_path);

    if (data == null){
        console.log('INFO - System exit since no project found.');
        return null;
    };

    result  = Report.createReport(data, start, root_path, root_json);

    if (JSON.stringify(result['Project']['Eslint Report']).includes('Not Committed Yet')){
        console.log('INFO - System exit since you have uncommitted contents.');
        return null;
    }

    var end = Math.floor((new Date()).getTime() / 1000);
    result['Date']['End'] = end;

    if (isSend == false){
        Transport.sendResult(token, result, host, port)
        return null;
    }
    else{
        Files.saveResult(args['output_path'], result)
        return result;
    }
};


// main body
if (typeof require != 'undefined' && require.main==module) {
    getResult(null, false);
}

