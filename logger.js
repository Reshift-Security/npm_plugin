const log = require('loglevel');
const util = require('util');
const validLogLevels =  ["error", "warn", "info", "debug"];

class Logger {
    constructor(logLevel, includeDateTime = false){
        log.setLevel(logLevel);
        this.includeDateTime = includeDateTime;
    }

    getMessage(message) {
        return this.includeDateTime ? util.format('%s: %s', new Date().toISOString(), message) : message;
    }

    error(message) {
        log.error(this.getMessage(message));
    }

    warn(message) {
        log.warn(this.getMessage(message));
    }

    info(message) {
        log.info(this.getMessage(message));
    }

    debug(message) {
        log.debug(this.getMessage(message));
    }
}

module.exports = {
    Logger: Logger,
    validLogLevels: validLogLevels
}
