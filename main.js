#!/usr/bin/env node
'use strict';

const config = require('./config.js');
const extractor = require('./extractor.js');
const git = require('./git.js');
const transport = require('./transport.js');


async function generateReport(configuration){
    if( !configuration.isValid() ){
        console.error("Invalid configuration used for the reshift-plugin-npm");
    }

    // lets get the git information for this project folder
    const gitInstance = new git.Git(configuration.projectDir)
    let meta = await gitInstance.branchInfo();
    meta['commitHash'] = await gitInstance.commitHash();

    var ex = new extractor.Extractor(configuration.projectDir)
    ex.writeProjectMeta(meta);
    ex.doTrap();
    const compressedFile = await ex.compressOutput();
    
    const sendMechanism = new transport.Transport();
    sendMechanism.sendResult(configuration.token, configuration.endpoint, compressedFile);
    ex.cleanup();
}

(async() => {
    if (typeof require != 'undefined' && require.main==module) {
        // const configuration = {
        //     'inDir': '<project root directory>',
        //     'token': '<token received during project onboarding with reshift-security>',
        //     'endpoint' : '<reshift endpoint - default to https://reshift.reshiftsecurity.com/'
        // };

        const configuration = new config.Config();
        await generateReport(configuration);
    }
})();
