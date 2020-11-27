'use strict';

const fs = require('fs');
const request = require('request').defaults({
    followRedirect: true,
    followAllRedirects: true, 
    jar:true
});
const urljoin = require('url-join'); 
const assert = require('assert');
const util = require('util');
const validUrl = require('valid-url');
const prettyMilliseconds = require('pretty-ms');
const packageInfo = require('./package.json');
const logger = require('./logger.js');

class ScanService {
    constructor(host, timeoutSeconds, language, logLevel){
        assert(validUrl.isUri(host), 'invalid host for scan service');
        this.serviceHost = host;
        this.serviceTimeoutMS = timeoutSeconds * 1000;
        if (language) {
            this.language = language;
        } else {
            this.language = 'javascript';
        }
        this.serviceRequestIntervalMS = 7000;
        this.requester_info = util.format('%s:%s', packageInfo.name, packageInfo.version);
        this.log = new logger.Logger(logLevel, true, true);
        this.log.info(util.format('Reshift Plugin version: %s', packageInfo.version));
        this.log.debug(util.format('Current timezone: %s', Intl.DateTimeFormat().resolvedOptions().timeZone));
        this.log.debug('Scanner service initialized');
    }

    sendRequest(requestOptions, parseJSON = true) {
        return new Promise((resolve, reject) => {
            request(requestOptions, (error, response, body) => {
                var isFailed = false;
                var responseCode = 1;
                if (error) {
                    this.log.error("Unable to perform request to reshift server.");
                    responseCode=521
                    userMessage=util.format("Connection refused: %s", this.serviceHost)
                    isFailed = true;
                } else {
                    if (response && response.statusCode >= 300) {
                        isFailed = true;
                        responseCode = response.statusCode;
                    }

                    var jsonBody = {};
                    var userMessage = response.statusMessage;
                    try {
                        jsonBody = JSON.parse(body);
                        if (jsonBody.scanMessage) {
                            userMessage = jsonBody.scanMessage;
                        }
                    } catch(e) {
                        jsonBody = {};
                        userMessage = response.statusMessage;
                    }
                }
                if (isFailed) {
                    this.log.error(util.format('<%s> %s', responseCode, userMessage));
                    resolve({});
                } else if (parseJSON) {
                    resolve(jsonBody);
                }

                resolve(body);
            });
        });
    }

    buildRequestOptions(uri, method = 'GET', data = {}) {
        return {
            method: method,
            uri: uri,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            formData: data
        };
    }

    printTotals(scanResponse) {
        this.log.debug('Printing scan summary results');
        if (scanResponse.details) {
            console.log('================ Reshift Security report summary:');
            console.log(util.format('    Critical: %s', scanResponse.details.critical.total));
            console.log(util.format('    High:     %s', scanResponse.details.high.total));
            console.log(util.format('    Moderate: %s', scanResponse.details.moderate.total));
            console.log(util.format('    Low:      %s', scanResponse.details.low.total));
            console.log('================');
        }
    }

    async getScanStatus(statusUrl, token, currentStatus, attemptCounter = 1, overtimeNotice = true) {
        this.log.debug('Fetching scan status...');
        const executionTime = this.serviceRequestIntervalMS * attemptCounter;
        if (executionTime > this.serviceTimeoutMS) {
            if (overtimeNotice) {
                this.log.info('Scan is still running. Execution time is taking a little longer than expected...');
                // Display notice only once
                overtimeNotice = false;
            }
        }

        assert(statusUrl, 'invalid status url');
        const statusResponse = await this.sendRequest(
            this.buildRequestOptions(
                statusUrl,
                'GET',
                {
                    token: token
                })
            );

        if (statusResponse.scanStatus) {
            const scanStatus = statusResponse.scanStatus;
            this.log.debug(util.format('Latest scan status: %s', scanStatus));
            switch(scanStatus) {
                case 'FAILED':
                    this.log.error(statusResponse.scanMessage);
                    return false;
                case 'COMPLETE':
                    this.log.info('Scan completed. Login to reshift dashboard to view report details.');
                    this.printTotals(statusResponse);
                    if (statusResponse.policyStatus === null) {
                        this.log.warn('Was not able to retrieve security report summary. Login to Reshift for report details.');
                    } else if (!statusResponse.policyStatus) {
                        this.log.error('RESHIFT SECURITY: Project failed security gate thresholds.');
                        return false;
                    }
                    return true;
                default:
                    if (scanStatus !== currentStatus) {
                        this.log.debug(util.format('Scan status changed %s', scanStatus));
                        this.log.info(util.format('%s %s', scanStatus, statusResponse.scanMessage));
                    }
                    await new Promise(r => setTimeout(r, this.serviceRequestIntervalMS));
                    return await this.getScanStatus(statusUrl, token, scanStatus, attemptCounter+1, overtimeNotice);
            }
        }

        this.log.debug('Unable to get scan status.');
        return false
    }

    async executeScan(token, projectProviderUrl, branch, commitHash) {
        assert(token, 'invalid token');
        assert(branch, 'invalid request body');
        assert(commitHash, 'invalid commit hash');
        assert(projectProviderUrl, 'project provider url required');
        this.log.debug('Scan request validated');

        const requestUrl = new URL(urljoin(this.serviceHost, '/scan/'));

        const scanRequestOptions = this.buildRequestOptions(
            requestUrl.toString(),
            'POST',
            {
                token: token,
                branch: branch,
                commit_hash: commitHash,
                project_git_url: projectProviderUrl,
                language: this.language,
                request_source: this.requester_info
            }
        );

        this.log.debug('Sending scan request');
        const scanResponse = await this.sendRequest(scanRequestOptions);
        if(scanResponse.statusUrl) {
            this.log.info('Scan initialized, executing...')
            return await this.getScanStatus(scanResponse.statusUrl, token, scanResponse.scanStatus);
        } else {
            this.log.error('Scan was not able to start successfully.');
        }
        return false;
    }
}

module.exports = {
    ScanService: ScanService
}