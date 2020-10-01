#!/usr/bin/env node
'use strict';

const config = require('./config.js');
const git = require('./git.js');
const scanService = require('./scan-service.js');
const util = require('util');
const prettyMilliseconds = require('pretty-ms');
const { exit } = require('process');

async function runScan(configuration) {
    if (!configuration.isValid()) {
        console.error('Invalid configuration used for the reshift-plugin-npm')
        exit(1);
    }

    // lets get the git information for this project folder
    const gitInstance = new git.Git(configuration.projectDir);
    const repoInfo = await gitInstance.getRepositoryInfo();
    const meta = await gitInstance.branchInfo();
    meta.commitHash = await gitInstance.commitHash();
    var branch = meta.remotes
    if (!!!branch) {
       branch = meta.local
       console.error('ERROR: Git project does not seem to have remote branch tracking. Unable to proceed with scan.');
       exit(1);
    }
    var gitStatus = await gitInstance.getGitStatus();
    if (!gitStatus.isClean()) {
        console.error('ERROR: Git project seems to have local changes or is not clean. Make sure local copy is in sync with remote.');
        exit(1);
    }
    if (gitStatus.ahead > 0 || gitStatus.behind > 0) {
        console.error('ERROR: Git project seems to be out of sync with remote (ahead/behind). Make sure local copy is in sync with remote.');
        exit(1);
    }
    var projectProviderUrl = repoInfo.href;
    
    var start = new Date();
    console.log(util.format('RESHIFT SECURITY: Starting security scan for project %s', repoInfo.full_name));
    const scannerService = new scanService.ScanService(configuration.endpoint, configuration.timeoutSeconds);
    const scanSuccess = await scannerService.executeScan(
        configuration.token,
        projectProviderUrl,
        branch,
        meta.commitHash
    );
    var scanTimeMs = new Date() - start;
    console.log(util.format("Finished in %s", prettyMilliseconds(scanTimeMs)));
    exit(scanSuccess ? 0 : 1);
}

(async () => {
    if (typeof require !== 'undefined' && require.main == module) {
        const configuration = new config.Config();
        await runScan(configuration);
    }
})()
