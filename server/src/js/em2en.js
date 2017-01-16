'use strict'

var
	fs = require('fs'),
	iconv = require('iconv-lite'),
	jschardet = require('jschardet');

//var exe = function(filename){
exports.exec = function(filename){
	var buf = fs.readFileSync(filename);

	var strVal;

	var enc = jschardet.detect(buf);
	if(enc.encoding !== 'UTF-8') strVal = iconv.decode(buf, enc.encoding);
	else strVal = buf.toString();

	var halfVal = strVal.replace(/[！-～]/g,
		function( tmpStr ) {
			return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
		}
	);

	fs.writeFileSync(filename, halfVal
		.replace(/\r/g, '')
		.replace(/\n*.*:\n/g, '\n')
		.replace(/;/g, ":")
		.replace(/”/g, "\"")
		.replace(/’/g, "'")
		.replace(/‘/g, "`")
		.replace(/￥/g, "\\")
		.replace(/　/g, " ")
		.replace(/〜/g, "~")
		.replace(/\n+/g, '\n')
		.replace(/^\n|\n$/g, '')
		.toUpperCase()
	);
}

//exe(process.argv[2]);
