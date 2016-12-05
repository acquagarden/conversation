'use strict'

var fs = require('fs');

var
	dirName = process.argv[2],
	ignoreName = process.argv[3],
	outputName = process.argv[4];

(function(){
	readDir(dirName).then(function(files){
		var promises = [];
		for(var fileName of files)
			promises.push(read(`${dirName}/${fileName}`, true));
			
		Promise.all(promises).then(create).then(write);
	});
})();

function create(array){
	return new Promise(function(resolve){
		read(ignoreName, false).then(function(ignore){
			ignore = ignore.split('\n');
			var list = merge(array);

			var str = '';
			for(var i in array)
				str += `,${i}`;
			str += '\n';

			var keys = Object.keys(list);
			for(var key of keys){
				if(ignore.indexOf(key) >= 0) continue;

				str += key;

				let ks = Object.keys(list[key]);
				for(var i = 0; i < array.length; i++)
					if(typeof list[key][i] === 'undefined') str += ',0';
					else str += `,${list[key][i]}`;
				str += '\n';
			}

			resolve({
				fileName: outputName,
				text: str
			});
		});
	});
}

function merge(array){
	var list = {};

	for(var i in array){
		let elem = array[i];
		let keys = Object.keys(elem);

		for(var key of keys){
			if(typeof list[key] === 'undefined'){
				list[key] = {};
				list[key][i] = elem[key];
			}else
				if(typeof list[key][i] === 'undefined')
					list[key][i] = elem[key];
				else list[key][i] += elem[key];
		}	
	}

	return list;
}

function read(fileName, isJSON){
	return new Promise(function(resolve){
		fs.readFile(fileName, function(err, data){
			if(err) throw err;

			if(isJSON) resolve(JSON.parse(data.toString()));
			else resolve(data.toString());
		});
	});
}

function readDir(dirName){
	return new Promise(function(resolve){
		fs.readdir(dirName, function(err, files){
			if(err) throw err;

			resolve(files.filter(function(value){
				if(/.*\.json$/.test(value)) return true;
				else return false;
			}));
		});
	});
}

function write(data){
	fs.writeFile(data.fileName, data.text, function(err){
		if(err) throw err;
	});
}
