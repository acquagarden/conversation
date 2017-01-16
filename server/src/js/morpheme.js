'use strict'

var 
	fs = require('fs'),
	request = require('request');

var 
	inputName = process.argv[2],
	outputName = process.argv[3];

(function(){
	read(inputName)
		.then(exec).catch(function(e){ console.log(e); })
		.then(write).catch(function(e){ console.log(e); });
})();

function read(fileName){
	return new Promise(function(resolve){
		fs.readFile(fileName, function(err, data){
			if(err) throw err;

			resolve(data.toString());
		});
	});
}

function write(data){
	fs.writeFile(data.fileName, data.text, function(err){
		if(err) throw err;
	});
}

function exec(str){
	return new Promise(function(resolve){
		request.post({
			url: 'http://jlp.yahooapis.jp/MAService/V1/parse',
			headers: {
				'Content-Type': 'json'
			},
			json: true,
			form: {
				appid: 'dj0zaiZpPWxaQmN6bWU4SkNEaiZzPWNvbnN1bWVyc2VjcmV0Jng9YWM-',
				sentence: str,
				results: 'ma'
			}
		}, function(err, res, body){
			if(err) throw err;

			resolve({
				fileName: outputName,
				text: body
			});
		});
	});
}
