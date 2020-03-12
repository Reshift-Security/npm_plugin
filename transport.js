'use strict';

const fs = require('fs');
const request = require('request').defaults({
    followRedirect: true,
    followAllRedirects: true, 
    jar:true
});
const FormData = require('form-data')
const urljoin = require('url-join'); 
const assert = require('assert');

class Transport {
    constructor(){
        
    }

    _url(host){
        return urljoin(host, '/r1_report_upload_endpoint/');
    }

    sendResult(token, host, filePath) {

        assert(token, 'invalid token');
        assert(host, 'invalid host');
        assert(filePath, 'invalid filePath');

        // Build the post string from an object
        var url         = this._url(host)
        var headers     = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Upgrade-Insecure-Requests": "1",
            "Content-Type": "multipart/form-data; boundary=" + (new Date().getTime()).toString(16)
        }

        var form = new FormData();
        form.append('token', token);
        form.append('reportdir_compressed', fs.createReadStream(filePath));
        form.submit(url, function(err, res) {
            if( err ){ console.error(err); }
        });
    }
}

module.exports = {
    Transport: Transport
}