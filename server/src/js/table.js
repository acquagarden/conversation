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
			ignore = ignore.words.split('\n');

			var list = merge(array, ignore);

			var members = [];
			for(var key1 of Object.keys(list))
				for(var key2 of Object.keys(list[key1]))
					if(members.indexOf(key2) < 0) members.push(key2);
			members.sort();

			var str = '';
			for(var i in members)
				str += `,${array[members[i]].fileName.split('_')[1].match(/.+(?=.json)/g)[0]}`;
			str += '\n';

			var keys = Object.keys(list);
			for(var key of keys){
				str += key;

				for(var i = 0; i < members.length; i++)
					if(typeof list[key][members[i]] === 'undefined') str += ',0';
					else str += `,${list[key][members[i]]}`;
				str += '\n';
			}

			resolve({
				fileName: outputName,
				text: str.normalize()
			});
		});
	});
}

function merge(array, ignore){
	var list = {};

	for(var i in array){
		let elem = array[i].words;
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

	var keys = Object.keys(list);
	for(var key of keys){
		let ks = Object.keys(list[key]);
		if(ignore.indexOf(key) >= 0 || ks.length === 1 && list[key][ks[0]] === 1) delete list[key];
		//if(ignore.indexOf(key) >= 0) delete list[key];
	}

	return list;
}

function read(fileName, isJSON){
	return new Promise(function(resolve){
		fs.readFile(fileName, function(err, data){
			if(err) throw err;

			if(isJSON) resolve({
				words: JSON.parse(data.toString()),
				fileName: fileName
			});
			else resolve({
				words: data.toString()
			});
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
