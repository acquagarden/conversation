'use strict'
var fs = require('fs');

exports.divide = function(params){

	var data = fs.readFileSync(params.inputName);

	var str = data.toString();

	var strAry = str.split('\n');

	var sizes = [];
	for(var i = 0; i < params.divnumber; i++)
		sizes.push(Math.floor((strAry.length+i)/params.divnumber));
	sizes.sort(function(a, b){ return b - a; });

	var ary = [];
	for(var i = 0, index = 0; i < params.divnumber; i++){
		ary.push([]);
		ary[i] += strAry[index++];
		for(var j = 1; j < sizes[i]; j++)
			ary[i] += '\n' + strAry[index++];		
	}

	for(var i = 0; i < ary.length; i++)
		fs.writeFileSync(`${params.outputDir}remark_${i}.txt`, ary[i]);
};
