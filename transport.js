const QueryString = require('querystring');
const Https       = require('https');
const Fs          = require('fs');
const Tmp         = require('tmp');
const FormData    = require('form-data')

const Files       = require('./file.js')


module.exports = {
    createForm: function(token, raw_data){
        var tmp_obj = Tmp.fileSync();
        Files.saveResult(tmp_obj.name, raw_data);
        var form = new FormData();
        form.append('token', token);
        form.append('my_buffer', new Buffer(10));
        form.append('file_format', 'json');
        form.append('reportfile', Fs.createReadStream(tmp_obj.name));

        return form;
    },


    createUrl: function(host, port){
        const end = '/r1_report_upload_endpoint/';
        var start = (port == 443) ? 'https://' : 'http://';
        var mid   = (host == null) ? 'reshift.softwaresecured.com' : host;
        return start + mid + end;
    },


    sendResult: function(token, raw_data, host, port) {
        // Build the post string from an object
        var form        = this.createForm(token, raw_data);
        var reshift_url = this.createUrl(host, port);

        // HACK
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        form.submit(reshift_url, function(error, response, body){
            if (!error && response.statusCode == 200) {
                console.log("INFO - Successfully upload the report.");
            } else {
                console.log("INFO - Failed to upload the report, status: " + response.statusCode);
                console.log("INFO - " + response.statusMessage);
              }
        });
    }
};
