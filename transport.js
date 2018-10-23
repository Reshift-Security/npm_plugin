const QueryString = require('querystring');
const Http = require('http');
const Fs = require('fs');


module.exports = {
    PostCode: function(raw_data) {
        // Build the post string from an object
        var post_data = querystring.stringify({
            'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
            'output_format': 'json',
            'output_info': 'compiled_code',
                'warning_level' : 'QUIET',
                'json' : raw_data
        });

        // An object of options to indicate where to post to
        var post_options = {
            host: 'closure-compiler.appspot.com',
            port: '80',
            path: '/compile',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();

    }
};
