const Common    = require('./common.js');
const Vcs       = require('./vcs.js');
const Files     = require('./file.js');
const Ast       = require('./ast.js');

const ESLint     = require("eslint");
const ESprima    = require('esprima');
const CLIEngine  = ESLint.CLIEngine;


module.exports = {
    /*
        AUDITSTR   := newType('AUDITSTR', string)
        description : function to execute 'npm audit' if 'package.json' in the dir.
        requires    : None,
        return:     : Optional[AUDITSTR]
    */
    runAudit: function(root_path){
        var data = Common.systemSync('ls', root_path);
        if (data.includes('package.json')) {
            // if lock not in the package, we need to create one.
            if (! data.includes('package-lock.json')){
                console.log('INFO - Creating locks for dependency checker.');
                Common.systemSync('npm i --package-lock-only', root_path);
            }
            return Common.systemSync('npm audit --json', root_path);
        }
        else{
            console.log('INFO - Unable to locate base package information, are you sure package.json included?');
            return null;
        }
    },


    /*
        description: function to create eslint raw report
        requires: root_json -> JSON
        returns: Optional[JSON]
    */
    runEslint: function(root_json, blame_inf){
        if(!root_json){
            return null;
        }

        var cli = new CLIEngine({
            envs: ["node", "es6"],
            fix: false, // difference from last example
            useEslintrc: false,
            plugins: ["security"],
            rules:{
                "security/detect-unsafe-regex": 2,
                "security/detect-buffer-noassert": 2,
                "security/detect-disable-mustache-escape": 2,
                "security/detect-eval-with-expression": 2,
                "security/detect-no-csrf-before-method-override": 2,
                "security/detect-non-literal-fs-filename": 2,
                "security/detect-non-literal-regexp": 2,
                "security/detect-non-literal-require": 2,
                "security/detect-object-injection": 2,
                "security/detect-possible-timing-attacks": 2,
                "security/detect-pseudoRandomBytes": 2
            }
        });
        var report     = cli.executeOnFiles(Object.keys(root_json));
        var err_report = CLIEngine.getErrorResults(report.results);
        return this.prepareReport(err_report, blame_inf)
    },


    _assignBlame: function(raw, report_store, start, end){
        if(!raw){ report_store.push(null); return;}
        var temp_store = [];

        raw_temp = raw.slice(start, end);
        raw_temp.forEach(blame => {
            temp_store.push(Vcs.genBlame(blame));
        });
        report_store.push(temp_store);
    },


    prepareReport: function(err_reports, blame_inf){
        err_reports.forEach(report => {
            f_path          = report['filePath'];
            raw_blame       = blame_inf[f_path] ? (blame_inf[f_path]).split('\n') : null;
            report['blame'] = []
            source          = report['source'].split('\n');
            raw_ast         = ESprima.parse(report['source'], {tolerant: true, loc: true})

            report['messages'].forEach(message =>{
                var start_line = message['line'] - 1;    //since line count starts at 0
                var end_line   = message['endLine'] === undefined ? message['line']: message['endLine'];
                var column     = message['column'] === undefined ? 0 : message['column'];
                var end_col    = message['endColumn'];
                this._assignBlame(raw_blame, report['blame'], start_line, end_line);
                Ast.findAst(raw_ast, start_line, end_line, column, end_col);
            });

            delete report['source'];

            report['ast']   = raw_ast;
        });
        return err_reports
    },


    /*
        STARTTIME   := newType('STARTTIME', str)
        description : function to create a bundle data
        requires    : data      -> JSON,
                    start     -> STARTTIME,
                    root_path -> str,
                    root_json -> JSON
        returns     : JSON
    */
    createReport: function(data, start, root_path, root_json){
        // get host name, parse raw data
        var host_name = Common.systemSync('hostname')
        var raw_data  = JSON.parse(data);
        var is_git    = Files.isGit(root_json);

        // get info related to git
        var git_hash  = null, proj_name = null, blame_inf = null, git_url = null;
        if (is_git){
            git_hash  = Vcs.getHash(root_path);
            proj_name = Vcs.getProject(root_path);
            blame_inf = Vcs.getBlame(root_path, root_json);
            git_url   = Vcs.getURL(root_path);
        }

        // get dependency related, assume package.json at root
        var package   = Files.loadPackage(root_path + '/package.json');
        var dep_lists = Files.getDependencyList(package);
        var blm_lists = Vcs.parseBlm(blame_inf, dep_lists);
        var es_data   = this.runEslint(root_json, blame_inf);
        // always ok for now, we need exception handler
        var status    = 0;

        var bundle = {}, date_time = {}, project = {}, project_meta = {}, vcs_info = {};
        bundle['Date']          = date_time;
        date_time['Start']      = start;
        bundle['Machine Name']  = host_name;
        bundle['Project']       = project;
        project['Dependency Report'] = raw_data;
        project['Eslint Report']     = es_data;
        project['Project Meta']      = project_meta;
        project_meta['Project Name'] = proj_name;
        project_meta['Dependencies'] = dep_lists;
        project_meta['Absolute pth'] = root_path;
        project_meta['Exit Code'] = status;
        project_meta['VCS Info']     = vcs_info;
        project_meta['File Info']    = root_json;
        project_meta['Root']         = '.';
        vcs_info['Git Url']          = git_url;
        vcs_info['Git Hash']         = git_hash;
        vcs_info['blm_lists']        = blm_lists;

        console.log(JSON.stringify(bundle))

        return bundle;
    }
}
