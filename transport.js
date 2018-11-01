const QueryString = require('querystring');
const Https       = require('https');
const Fs          = require('fs');
const Tmp         = require('tmp');
const FormData    = require('form-data')

const Files       = require('./file.js')


module.exports = {
    /*
        description : function to create the form for submission
        requires    : token    -> str,
                      raw_data -> JSON
        returns     : FormData.FormData
    */
    createForm: function(token, raw_data){
        var tmp_obj = Tmp.fileSync();
        Files.saveResult(tmp_obj.name, raw_data);
        var form = new FormData();
        form.append('token', token);
        form.append('my_buffer', new Buffer(10));
        form.append('fileformat', 'json');
        form.append('reportfile', Fs.createReadStream(tmp_obj.name));

        return form;
    },


    /*
        URLSTR     := newType('URLSTR', str)
        description : function to create the url used for communication
        requires    : host    -> str,
                      port    -> int
        returns     : URLSTR
    */
    createUrl: function(host, port){
        const end = '/r1_report_upload_endpoint/';
        var start = (port == 443) ? 'https://' : 'http://';
        var mid   = (host == null) ? 'reshift.softwaresecured.com' : host;
        return start + mid + ":" + port + end;
    },


    /*
        description : function to transport to reshift
        requires    : token    -> str,
                      raw_data -> JSON,
                      host     -> str,
                      port     -> int
        returns     : None
    */
    sendResult: function(token, raw_data, host, port) {
        // Build the post string from an object
        var form        = this.createForm(token, raw_data);
        var reshift_url = this.createUrl(host, port);

        form.submit(reshift_url, function(error, response, body){
            if (!error && response.statusCode == 200) {
                console.log("INFO - Successfully upload the report.");
            } else {
                let status = (response == null) ? null : response.statusCode
                let msg    = (response == null) ? null : response.statusMessage
                console.log("INFO - Failed to upload the report, status: " + status);
                console.log("INFO - Return message: " + msg);
              }
        });
    }
};
