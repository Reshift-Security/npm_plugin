'use strict';

const assert = require('assert');
/**
 * commit hash: git rev-parse HEAD
 * current branch: git branch -vv
 */
class Git{
    constructor(projectRoot){
        this.simpleGit = require('simple-git')(projectRoot);
    }

    async branchInfo(){
        const branchPromise = new Promise(function(resolve, reject){
            this.simpleGit.branch({'-vv': null}, function(err, summary){
                if( err ){ reject(err); } 
                else { resolve(summary); }
            });
        }.bind(this));
        const branchResult = await branchPromise;
        let info = {};
        if (branchResult.current in branchResult.branches){
            const matches = branchResult.branches[branchResult.current].label.match(/\[(.*)\]/);
            if( matches && matches.length >= 2 ){
                info['remotes'] = matches[1];
            }
            info['local'] = branchResult.branches[branchResult.current].name;
        }
        return info;
    }

    async commitHash(){
        const revParse = new Promise(function(resolve, reject){
            this.simpleGit.revparse(['HEAD'], function(err, summary){
                if( err ){ reject(err); } 
                else { resolve(summary); }
            });
        }.bind(this));

        return await revParse;
    }
}

module.exports = {
    Git : Git
}