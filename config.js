'use strict';

const ArgumentParser = require('argparse').ArgumentParser;
const fs = require("fs");

class Config {
    constructor(config){
        this.token = null;
        this.projectDir = null;
    }

    _parseCommon(config){
        this.token = ('token' in config && config['token']) ? config['token']: null;
        this.projectDir = ('inDir' in config && config['inDir']) ? config['inDir']: null;
        this.endpoint = ('endpoint' in config && config['endpoint']) ? config['endpoint']: 'https://reshift.reshiftsecurity.com/';
    }

    parseConfig(config){
        this._parseCommon(config);
    }

    parseCLI(){
        const parser = new ArgumentParser({
            version: '1.1.91',
            addHelp:true,
            description: 'NPM security plugin'
        });
        parser.addArgument( [ '-t', '--token' ], { help: 'Token MUST be specified to upload reports', required: true });
        parser.addArgument( [ '-i', '--inDir' ], { help: 'Root directory of a project MUST be specified', required: true });
        parser.addArgument( [ '-e', '--endpoint' ], { 
            help: 'Optional host endpoint, default https://reshift.reshiftsecurity.com/',
            required: false
        });
        const args = parser.parseArgs();

        this._parseCommon(args);
    }

    isValid(){
        if( !this.token ){
            console.error('invalid token');
            return false;
        }
        if( !this.projectDir || !fs.existsSync(this.projectDir) ){
            console.error('invalid inDir or project directory does not exists');
            return false;
        }

        return true;
    }
}

module.exports = {
    Config: Config
}