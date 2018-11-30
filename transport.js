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
        // var form = new FormData();
        // form.append('token', token);
        // form.append('my_buffer', new Buffer(10));
        // form.append('fileformat', 'json');
        // form.append('reportfile', Fs.createReadStream(tmp_obj.name));

        // form data
        var form = QueryString.stringify({
            token: token,
            fileformat: 'json',
            buffer: new Buffer(10),
            reportfile: Fs.createReadStream(tmp_obj.name),
        });



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
        var options = {
            host: host,
            port: port,
            cookie: true,
            method: 'POST',
            path: '/r1_report_upload_endpoint/',
            headers: {
                'Authorization' : 'Bearer 56356363',
                'Accept' : 'application/json'
            }
        };

        var req = Https.request(options, function(res) {
            var buffer = "";
            res.on('data', function(chunk) {
                buffer += chunk.toString();
            });
            res.on('end', function(chunk) {
                console.log(QueryString.parse(buffer));
            });
            req.on('error', function(e) {
                console.log('problem with request:', e.message);
            });
        });
         var form = this.createForm(token, raw_data);

        // req error
        req.on('error', function (err) {
            console.log(err);
        });

        //send request witht the postData form
        req.write(form);
        req.end();


        // form.pipe(req);
    }
};
