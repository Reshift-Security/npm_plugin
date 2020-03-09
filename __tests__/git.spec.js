const git = require('../git.js');
const tmp = require('tmp');

describe("Test Git", () => {
    test("git commitHash should return 461e7a1d21727dc3905237f38253da4d2ef0dc76", done => {

        const remote = 'https://github.com/softwaresecured/FaceBroke.git';
        const tempDirectory = tmp.dirSync();
        const gitClone = require('simple-git/promise')(tempDirectory.name);

        gitClone.clone(remote).then(() => {
            const gitCheckout = require('simple-git/promise')(tempDirectory.name + '/FaceBroke');
            gitCheckout.checkout('461e7a1d21727dc3905237f38253da4d2ef0dc76').then(()=>{
                const gitInstance = new git.Git(tempDirectory.name + '/FaceBroke');
                gitInstance.commitHash().then(result=>{
                    expect(result).toBe('461e7a1d21727dc3905237f38253da4d2ef0dc76');
                    done();
                });
            });
        });
    });

    test("git branchInfo should return master", done => {

        const remote = 'https://github.com/softwaresecured/FaceBroke.git';
        const tempDirectory = tmp.dirSync();
        const gitClone = require('simple-git/promise')(tempDirectory.name);

        gitClone.clone(remote).then(() => {
            const gitInstance = new git.Git(tempDirectory.name + '/FaceBroke');
            gitInstance.branchInfo().then(result=>{
                expect(result.remotes).toBe('origin/master');
                expect(result.local).toBe('master');
                done();
            });
        });
    });
});