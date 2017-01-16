'use strict'

var
	fs = require('fs');

var 
	inputName = process.argv[2],
	outputName = process.argv[3],
	options = process.argv[4].split(',');

(function(){
	read(inputName)
		.then(extract).catch(function(e){ console.log(e); })
		.then(write).catch(function(e){ console.log(e); });
})();

function extract(str){
	return new Promise(function(resolve){
		var words = {};
		var list = str.match(/<word>.*?<\/word>/g);

		for(var elem of list){
			let pos = elem.match(/<pos>.*?<\/pos>/g);
			let parts = pos[0].match(/((?![<\/*pos>]).)+/g)[0];
			if(options.indexOf(parts) >= 0){
				let sur = elem.match(/<surface>.*?<\/surface>/g);
				let word = sur[0].match(/((?![<\/*surface>]).)+/g)[0].replace(/,/g, '');
				if(typeof words[word] === 'undefined') words[word] = 1;
				else words[word]++;
			}
		}

		resolve({
			fileName: outputName,
			text: JSON.stringify(words)
		});
	});
}	

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
