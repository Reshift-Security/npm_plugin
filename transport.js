const Fs          = require('fs');
const Tmp         = require('tmp');
const Request     = require('request').defaults({
                        followRedirect: true,
                        followAllRedirects: true
                    });
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
        return {
            'fileformat': 'json',
            'token': token,
            'reportfile': Fs.createReadStream(tmp_obj.name)
        };
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