#!/usr/bin/env node
'use strict';

const config = require('./config.js');
const extractor = require('./extractor.js');
const git = require('./git.js');
const transport = require('./transport.js');


async function generateReport(configuration){
    const newConfig = new config.Config(configuration);
    if( !newConfig.isValid() ){
        console.error("Invalid configuration used for the reshift-plugin-npm");
    }

    // lets get the git information for this project folder
    const gitInstance = new git.Git(newConfig.projectDir)
    let meta = await gitInstance.branchInfo().then(result=>result);
    meta['commitHash'] = await gitInstance.commitHash().then(result=>result);

    var ex = new extractor.Extractor(newConfig.projectDir)
    ex.writeProjectMeta(meta);
    ex.doTrap();
    const compressedFile = await ex.compressOutput();
    
    const sendMechanism = new transport.Transport();
    sendMechanism.sendResult(newConfig.token, newConfig.endpoint, compressedFile);
    ex.cleanup();
}

(async() => {
    if (typeof require != 'undefined' && require.main==module) {
        const configuration = null;
        // const configuration = {
        //     'inDir': '<project root directory>',
        //     'token': '<token received during project onboarding with reshift-security>',
        //     'endpoint' : '<reshift endpoint - default to https://reshift.reshiftsecurity.com/'
        // };
        await generateReport(configuration);
    }
})();
