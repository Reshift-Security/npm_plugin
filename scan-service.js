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

class ScanService {
    serviceHost
    serviceTimeoutMS
    serviceRequestIntervalMS = 30000
    requester_info = util.format('%s:%s', packageInfo.name, packageInfo.version)
    logError = 'ERROR';
    logWarn = 'WARN';

    constructor(host, timeoutSeconds, language){
        assert(validUrl.isUri(host), 'invalid host for scan service');
        this.serviceHost = host;
        this.serviceTimeoutMS = timeoutSeconds * 1000;
        if (language) {
            this.language = language;
        } else {
            // TODO: look into making this more dynamic (auto-detect) if possible
            this.language = 'javascript';
        }
    }

    log(message, levelPrefix = 'INFO') {
        const userMessage = util.format('%s: %s %s', 
            new Date().toISOString(),
            levelPrefix,
            message);
        
        switch(levelPrefix) {
            case this.logError:
                console.error(userMessage);
                break;
            case this.logWarn:
                console.warn(userMessage);
                break;
            default:
                console.log(userMessage);
                break;
        }
    }

    sendRequest(requestOptions, parseJSON = true) {
        return new Promise((resolve, reject) => {
            request(requestOptions, (error, response, body) => {
                var isFailed = false;
                var responseCode = 1;
                if (error) {
                    console.error(error);
                    isFailed = true;
                }
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
                if (isFailed) {
                    console.error(util.format('ERROR <%s> %s', responseCode, userMessage));
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
        if (scanResponse.details) {
            console.log('================ Reshift Security report summary:');
            console.log(util.format('    Critical: %s', scanResponse.details.critical.total));
            console.log(util.format('    High:     %s', scanResponse.details.high.total));
            console.log(util.format('    Moderate: %s', scanResponse.details.moderate.total));
            console.log(util.format('    Low:      %s', scanResponse.details.low.total));
            console.log('================');
        }
    }

    async getScanStatus(statusUrl, token, currentStatus, attemptCounter = 1) {
        if ((this.serviceRequestIntervalMS * attemptCounter) > this.serviceTimeoutMS) {
            console.error(util.format('TIMEOUT: Scan execution time exceeded timeout setting of %s', 
                prettyMilliseconds(this.serviceTimeoutMS)));
            return false;
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
            switch(scanStatus) {
                case 'FAILED':
                    this.log(statusResponse.scanMessage, this.logError);
                    return false;
                case 'COMPLETE':
                    this.log('Scan completed. Login to reshift dashboard to view report details.');
                    this.printTotals(statusResponse);
                    if (statusResponse.policyStatus === null) {
                        this.log('Was not able to retrieve security report summary. Login to Reshift for report details.', this.logWarn);
                    } else if (!statusResponse.policyStatus) {
                        this.log('RESHIFT SECURITY: Project failed security gate thresholds.', this.logError);
                        return false;
                    }
                    return true;
                default:
                    if (scanStatus !== currentStatus) {
                        this.log(util.format('%s %s', scanStatus, statusResponse.scanMessage));
                    }
                    await new Promise(r => setTimeout(r, this.serviceRequestIntervalMS));
                    return await this.getScanStatus(statusUrl, token, scanStatus, attemptCounter+1);
            }
        }

        return false
    }

    async executeScan(token, projectProviderUrl, branch, commitHash) {
        assert(token, 'invalid token');
        assert(branch, 'invalid request body');
        assert(commitHash, 'invalid commit hash');
        assert(projectProviderUrl, 'project provider url required');

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

        const scanResponse = await this.sendRequest(scanRequestOptions);
        if(scanResponse.statusUrl) {
            this.log('Scan initialized, executing...')
            return await this.getScanStatus(scanResponse.statusUrl, token, scanResponse.scanStatus);
        } else {
            this.log('Scan was not able to start successfully.', this.logError);
        }
        return false;
    }
}

module.exports = {
    ScanService: ScanService
}