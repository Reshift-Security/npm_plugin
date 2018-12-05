const Fs          = require('fs');
const Tmp         = require('tmp');
const Request     = require('request').defaults({
                        followRedirect: true,
                        followAllRedirects: true
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
        Request.post(url,{formData: form},
            function(err, resp, body){
                if(resp.statusCode == 200){
                    console.log("INFO - Successfully upload the report.");
                }
                else{
                    console.log('Err - ' + body.toString());
                }
            }
        );
    }
};