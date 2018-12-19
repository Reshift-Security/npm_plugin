const Fs          = require('fs');
const Tmp         = require('tmp');
const Request     = require('request').defaults({
                        followRedirect: true,
                        followAllRedirects: true,
                        jar:true,
                    });
const FormData    = require('form-data')

const Files       = require('./file.js')


/**
 * transport module manage the communication
 * @module npm_plugin/transport
 */
module.exports = {
    /**
     * generate current git hash
     * @param  {string} token    - The reporter token obtained from reshift
     * @param  {json}   raw_data - A complete report
     * @return {json}   - return the form as a json
     */
    createForm: function(token, raw_data){
        var tmp_obj = Tmp.fileSync();
        Files.saveResult(tmp_obj.name, raw_data);
        return {
            'fileformat': 'json',
            'token': token,
            'reportfile': Fs.createReadStream(tmp_obj.name)
        };
    },


    /**
     * generate current git hash
     * @param  {string}   host      - The host to sent report (default to reshift)
     * @param  {int}      port      - The port to sent report (default to https)
     * @return {string}   - return the url as a string
     */
    createUrl: function(host, port){
        const end = '/r1_report_upload_endpoint/';
        var port  = (port == null) ? '443' : port;
        var start = (port == 443) ? 'https://' : 'http://';
        var mid   = (host == null) ? 'reshift.softwaresecured.com' : host;
        return start + mid + ":" + port + end;
    },


    /**
     * send result to reshift as a post request
     * @param  {string}   token     - The reporter token obtained from reshift
     * @param  {json}     raw_data  - A complete report
     * @param  {string}   host      - The host to sent report (default to reshift)
     * @param  {int}      port      - The port to sent report (default to https)
     * @return {null}
     */
    sendResult: function(token, raw_data, host, port) {
        // Build the post string from an object
        var form        = this.createForm(token, raw_data);
        var url         = this.createUrl(host, port)
        var headers     = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Upgrade-Insecure-Requests": "1",
            "Content-Type": "multipart/form-data; boundary=" + (new Date().getTime()).toString(16)
        }

        Request(url, function(){
            Request.post({url: url, formData: form, headers: headers},
                function(err, resp, body){
                    if(resp.statusCode == 200){
                        console.log("INFO - Successfully upload the report.");
                    }
                    else{
                        console.log('Err - ' + body.toString());
                    }
                }
            );
        });
    }

};