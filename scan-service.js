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

class ScanService {
    serviceHost
    serviceTimeoutMS
    serviceRequestIntervalMS = 5000
    constructor(host, timeoutSeconds){
        assert(validUrl.isUri(host), 'invalid host for scan service');
        this.serviceHost = host;
        this.serviceTimeoutMS = timeoutSeconds * 1000;
    }

    sendRequest(requestOptions, parseJSON = true) {
        return new Promise((resolve, reject) => {
            request(requestOptions, (error, response, body) => {
                var isFailed = false;
                if (error) {
                    console.error(error);
                    isFailed = true;
                }
                if (response && response.statusCode >= 300) {
                    console.error(util.format('Request failed <%s> %s', response.statusCode, response.statusMessage));
                    isFailed = true;
                }
                if (isFailed) {
                    resolve({});
                }
                if (parseJSON) {
                    try {
                        const jsonBody = JSON.parse(body);
                        resolve(jsonBody);
                    } catch(e) {
                        resolve({});
                    }
                } else {
                    resolve(body);
                }
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
            console.log('================ Scan result summary:');
            console.log(util.format('    Critical: %s', scanResponse.details.critical.total));
            console.log(util.format('    High:     %s', scanResponse.details.high.total));
            console.log(util.format('    Moderate: %s', scanResponse.details.moderate.total));
            console.log(util.format('    Low:      %s', scanResponse.details.low.total));
            console.log('================');
        }
    }

    async getScanStatus(statusUrl, currentStatus, attemptCounter = 1) {
        if ((this.serviceRequestIntervalMS * attemptCounter) > this.serviceTimeoutMS) {
            console.error(util.format('TIMEOUT: Scan execution time exceeded timeout setting of %s', 
                prettyMilliseconds(this.serviceTimeoutMS)));
            return false;
        }

        assert(statusUrl, 'invalid status url');
        const statusResponse = await this.sendRequest(this.buildRequestOptions(statusUrl));

        if (statusResponse.scanStatus) {
            const scanStatus = statusResponse.scanStatus;
            switch(scanStatus) {
                case 'FAILED':
                    console.log(util.format('Error occurred while executing scan %s', 
                        statusResponse.statusMessage));
                    return false;
                case 'COMPLETE':
                    console.log('Scan completed. Login to reshift dashboard to view report details.');
                    this.printTotals(statusResponse);
                    if (statusResponse.policyStatus === 'False') {
                        console.error('Project failed security gate thresholds');
                        return false;
                    }
                    return true;
                default:
                    if (scanStatus !== currentStatus) {
                        console.log(util.format('Scan status: %s %s', scanStatus, statusResponse.statusMessage));
                    }
                    await new Promise(r => setTimeout(r, this.serviceRequestIntervalMS));
                    return await this.getScanStatus(statusUrl, scanStatus, attemptCounter+1);
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
                project_git_url: projectProviderUrl
            }
        );

        const scanResponse = await this.sendRequest(scanRequestOptions);
        if(scanResponse.statusUrl) {
            console.log('Scan initialized, executing...')
            return await this.getScanStatus(scanResponse.statusUrl, scanResponse.scanStatus);
        } else {
            console.error('Scan was not able to start successfully.');
        }
        return false;
    }
}

module.exports = {
    ScanService: ScanService
}