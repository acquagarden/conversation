'use strict'
var fs = require('fs');

exports.divideTime = function(params){
	var data = fs.readFileSync(params.inputName);

	var str = data.toString();

	var strAry = str.replace(/\r/g, '').split('\n');

	var sizes = [];
	for(var i = 0; i < params.divnumber; i++)
		sizes.push(Math.floor((strAry.length+i)/params.divnumber));
	sizes.sort(function(a, b){ return b - a; });

	var ary = [];
	for(var i = 0, index = 0; i < params.divnumber; i++){
		ary.push([]);
		ary[i] += strAry[index++].split(':')[1];
		for(var j = 1; j < sizes[i]; j++)
			ary[i] += '\n' + strAry[index++].split(':')[1];		
	}

	for(var i = 0; i < ary.length; i++)
		fs.writeFileSync(`${params.outputDir}remark_${i}.txt`, ary[i]);
};

exports.dividePerson = function(params){
	var data = fs.readFileSync(params.inputName);
	
	var strAry = data.toString().replace(/\r/g, '').split('\n');

	var texts = {};
	for(var str of strAry){
		let ary = str.split(':');
		if(typeof texts[ary[0]] === 'undefined') texts[ary[0]] = [];
		
		texts[ary[0]].push(ary[1]);
	}

	var keys = Object.keys(texts).sort();
	
	for(var i = 0; i < keys.length; i++)
		fs.writeFileSync(`${params.outputDir}remark_${[keys[i]]}.txt`, texts[keys[i]]);
};
