'use strict';

const compressing = require('compressing');
const fs = require('fs');
const java = require('java');
const tmp = require('tmp');
const assert = require('assert');


class Extractor {
    constructor(projectRoot){
        this.projectRoot = projectRoot;

        // FIXME: temporarily put the extractor JAR file within this folder.
        // in the future the library will pull from Central Repository enabled by the node-java-maven
        const depRoot = "./dependencies/";
        this.dependencies = fs.readdirSync(depRoot)
        this.dependencies.forEach(function(dependency){
            java.classpath.push(depRoot + dependency);
        })

        this.projectOutputDir = tmp.dirSync();

        // set environment variables needed by the extractor jar
        // CODEQL_EXTRACTOR_JAVASCRIPT_ROOT = where should the trap files go
        // TRAP_FOLDER_JAVASCRIPT = where should the trap files go
        // LGTM_SRC = point the extractor to the project root
        // LGTM_INDEX_TYPESCRIPT = None to disable typescript parsing
        process.env.CODEQL_EXTRACTOR_JAVASCRIPT_ROOT = this.projectOutputDir.name;
        process.env.TRAP_FOLDER_JAVASCRIPT = this.projectOutputDir.name;
        process.env.LGTM_SRC = this.projectRoot;
        process.env.LGTM_INDEX_TYPESCRIPT = 'NONE';

    }

    cleanup(){
        if( this.projectOutputDir ){
            this.projectOutputDir.removeCallback();
            this.projectOutputDir = null;
        }
        if( this.packagedFile ){
            this.packagedFile.removeCallback();
            this.packagedFile = null;
        }   
    }

    /**
     * The extractor works by pointing autobuild (from the extractor.jar) to a project folder by
     * setting specific env variables and then running the extraction process.
     * The output is a folder containing matching files to the project. These files are called "Trap" files.
     */
    doTrap() {
        assert(this.projectOutputDir, 'invalid project output directory');
        const extractorInstance = java.newInstanceSync("com.semmle.js.extractor.AutoBuild");
        try {
            java.callMethodSync(extractorInstance, "run");
        } catch(ex){
            // the Jar can return java.nio.file.NoSuchFileException: <tmpdir>/tools/data/externs
            // this is normal
            // console.log(ex.message);
        }
    }

    writeProjectMeta(meta){
        assert(this.projectOutputDir, 'invalid project output directory');

        fs.writeFile(this.projectOutputDir.name + '/projectMeta.json', JSON.stringify(meta), function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }

    async compressOutput(){
        this.packagedFile = tmp.fileSync();
        await compressing.tar.compressDir(this.projectOutputDir.name, this.packagedFile.name)
        .then(result=>result)
        .catch(function(reason){
            console.error(reason);
        });
        return this.packagedFile.name;
    }
}

module.exports = {
    Extractor: Extractor
}