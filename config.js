'use strict';

const ArgumentParser = require('argparse').ArgumentParser;
const fs = require("fs");
const validUrl = require('valid-url');
const packageInfo = require('./package.json');
const util = require('util');
const detaultTimeoutSeconds = 600;
const logger = require('./logger.js');

class Config {
    constructor(config = null){
        this.token = null;
        this.projectDir = null;
        this.endpoint = null;
        this.logLevel = null;
        this.nonblocking = null;

        if(!config){
            // The caller did not pass in a configuration dictionary
            // in this case parse out the config via CLI
            this.parseCLI()
        } else {
            this.parseCommon(config);
        }
    }

    parseCommon(config){
        this.token = ('token' in config && config['token']) ? config['token']: null;
        this.projectDir = ('projectDir' in config && config['projectDir']) ? config['projectDir']: '.';
        this.endpoint = ('endpoint' in config && config['endpoint']) ? config['endpoint']: 'https://reshift.reshiftsecurity.com/';
        this.timeoutSeconds = detaultTimeoutSeconds;
        this.logLevel = ('logLevel' in config && config['logLevel']) ? config['logLevel']: 'info';
        this.nonblocking = 'nonblocking' in config && config['nonblocking'] ? config['nonblocking'] > 0: false;
    }

    parseCLI(){
        const parser = new ArgumentParser({
            version: packageInfo.version,
            addHelp: true,
            description: 'NPM security plugin'
        });
        parser.addArgument( [ '-t', '--token' ], {
            help: 'Reshift Token MUST be specified to run a scan', 
            required: true 
        });
        parser.addArgument( [ '-p', '--projectDir' ], {
            help: 'Optional Root directory of a project to be scanned. Default is current directory "."',
            required: false 
        });
        parser.addArgument( [ '-e', '--endpoint' ], { 
            help: 'Optional host endpoint, default https://reshift.reshiftsecurity.com/',
            required: false
        });
        parser.addArgument( [ '-l', '--logLevel' ], { 
            help: util.format('Optional plugin logging level (default: info). Options are: %s', logger.validLogLevels),
            required: false
        });
        parser.addArgument( [ '-n', '--nonblocking' ], {
            type: 'int',
            help: 'Optional non-blocking scan. Will return immediately once scan is initialized.',
            required: false
        });

        const args = parser.parseArgs();
        this.parseCommon(args);
    }

    isValid(){
        if( !this.token ){
            console.error('Configuration Error: invalid token');
            return false;
        }
        if( !this.projectDir || !fs.existsSync(this.projectDir) ){
            console.error('Configuration Error: invalid projectDir or project directory does not exists (please use absolute path)');
            return false;
        }
        if ( !this.endpoint || !validUrl.isUri(this.endpoint) ){
            console.error('Configuration Error: invalid endpoint; endpoint URL needs to be a valid http(s) url');
            return false;
        }
        if (!logger.validLogLevels.includes(this.logLevel)) {
            console.error(util.format('Configuration Error: invalid log level setting %s', this.logLevel));
            return false;
        }

        return true;
    }
}

module.exports = {
    Config: Config
}