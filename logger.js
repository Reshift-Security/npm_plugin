const log = require('loglevel');
const util = require('util');
const validLogLevels =  ["error", "warn", "info", "debug"];

class Logger {
    constructor(logLevel, includeDateTime = false, includeLevelPrefix = false){
        log.setLevel(logLevel);
        this.includeDateTime = includeDateTime;
    }

    getPrefixedMessage(message, prefix) {
        message = this.includeLevelPrefix ? util.format('%s: %s', prefix, message) : message;
        return this.includeDateTime ? 
            util.format('%s %s: %s', new Date().toISOString(), prefix, message) : 
            message;
    }

    error(message) {
        log.error(this.getPrefixedMessage(message, 'ERROR'));
    }

    warn(message) {
        log.warn(this.getPrefixedMessage(message, 'WARN'));
    }

    info(message) {
        log.info(this.getPrefixedMessage(message, 'INFO'));
    }

    debug(message) {
        log.debug(this.getPrefixedMessage(message, 'DEBUG'));
    }
}

module.exports = {
    Logger: Logger,
    validLogLevels: validLogLevels
}
