module.exports = {
    _mapAnnotation: function(loc, start_line, end_line, column, end_col){
        raw_start = loc['start']['line'];
        raw_end   = loc['end']['line'];
        raw_col   = loc['start']['column'];
        raw_ec    = loc['end']['column'];

        span1     = raw_start >= start_line && raw_end <= end_line;
        span2     = raw_col >= column && raw_ec <= end_col;

        if(span1 && (end_line != 1)) { return true; }  // line span matches and not just one line in a file
        else if(span1 && span2) { return true; }  // one line in a file and use column
        else { return false; }
    },


    findAst: function(raw_ast, start_line, end_line, column, end_col){
        var keys      = Object.keys(raw_ast);
        var err_index = keys.indexOf('errors');
        var loc_index = keys.indexOf('loc');

        if(err_index > -1){ keys.splice(err_index, 1); }
        if(loc_index > -1){
            keys.splice(loc_index, 1);
            raw_ast['annotation'] = this._mapAnnotation(raw_ast['loc'], start_line, end_line, column, end_col);
        }

        keys.forEach(key =>{
            if(typeof(raw_ast[key]) === 'object' && raw_ast[key] != null){
                this.findAst(raw_ast[key], start_line, end_line, column, end_col);
            }
        });
    },
}