'use strict'

var
	fs = require('fs'),
	exec = require('child_process').execSync,
	em2en = require(__dirname + '/em2en'),
	divide = require(__dirname + '/divide');

exports.exec = function(params){
	var
		filename = params.file.filename,
		dirname = {
			text: `./server/res/texts/${filename}`,
			root: `./server/res/files/${filename}/`,
			js: `${__dirname}/`,
			r: `${__dirname}/../R/`
		};

	em2en.exec(dirname.text);

	fs.mkdirSync(`${dirname.root}`);
	fs.mkdirSync(`${dirname.root}person`);
	fs.mkdirSync(`${dirname.root}person/remark`);

	console.log('1');

	divide.dividePerson({
		inputName: `${dirname.text}`,
		outputDir: `${dirname.root}person/remark/`
	});

	fs.mkdirSync(`${dirname.root}person/morpheme`);
	fs.mkdirSync(`${dirname.root}person/morpheme/xml`);

	console.log('2');
	(function(){
		var files = fs.readdirSync(`${dirname.root}person/remark`);
		for(var i in files)
			exec(`node ${dirname.js}morpheme.js ${dirname.root}person/remark/${files[i]} ${dirname.root}person/morpheme/xml/morpheme_${files[i].split('_')[1].match(/.+(?=\.txt)/g)[0]}.xml`);
	})();

	fs.mkdirSync(`${dirname.root}person/morpheme/json`);

	console.log('3');
	(function(){
		var files = fs.readdirSync(`${dirname.root}person/morpheme/xml`);
		for(var i in files)
			exec(`node ${dirname.js}extract.js ${dirname.root}person/morpheme/xml/${files[i]} ${dirname.root}person/morpheme/json/morpheme_${files[i].split('_')[1].match(/.+(?=\.xml)/g)[0]}.json ${params.parts}`);
	})();

	console.log('4');
	exec(`node ${dirname.js}table.js ${dirname.root}person/morpheme/json ./server/src/ignore.txt ${dirname.root}person/tabulation.csv`);

	fs.mkdirSync(`${dirname.root}person/corresp`);

	console.log('5');
	exec(`docker run -i --rm -v ${process.cwd()}:/tmp r-nmf R --vanilla --slave --args tmp/${dirname.root}person/tabulation.csv tmp/${dirname.root}person/corresp/index.csv tmp/${dirname.root}person/corresp/rscore.csv tmp/${dirname.root}person/corresp/cscore.csv ${params.cluster} ${params.components[1]} ${params.components[2]} < ${dirname.r}corresp.R`);

	fs.mkdirSync(`${dirname.root}time`);
	fs.mkdirSync(`${dirname.root}time/remark`);

	console.log('6');
	divide.divideTime({
		inputName: `${dirname.text}`,
		outputDir: `${dirname.root}time/remark/`,
		divnumber: params.number.divide
	});

	fs.mkdirSync(`${dirname.root}time/morpheme`);
	fs.mkdirSync(`${dirname.root}time/morpheme/xml`);

	console.log('7');
	(function(){
		var files = fs.readdirSync(`${dirname.root}time/remark`);
		for(var i in files)
			exec(`node ${dirname.js}morpheme.js ${dirname.root}time/remark/${files[i]} ${dirname.root}time/morpheme/xml/morpheme_${i}.xml`);
	})();

	fs.mkdirSync(`${dirname.root}time/morpheme/json`);

	console.log('8');
	(function(){
		var files = fs.readdirSync(`${dirname.root}time/morpheme/xml`);
		for(var i in files)
			exec(`node ${dirname.js}extract.js ${dirname.root}time/morpheme/xml/${files[i]} ${dirname.root}time/morpheme/json/morpheme_${i}.json ${params.parts}`);
	})();

	console.log('9');
	exec(`node ${dirname.js}table.js ${dirname.root}time/morpheme/json ./server/src/ignore.txt ${dirname.root}time/tabulation.csv`);

	console.log('10');
	exec(`docker run -i --rm -v ${process.cwd()}:/tmp r-nmf R --vanilla --slave --args tmp/${dirname.root}time/tabulation.csv tmp/${dirname.root}time/tfidf.csv ${params.correction} < ${dirname.r}tfidf.R`);

	fs.mkdirSync(`${dirname.root}time/nmf`);
	fs.mkdirSync(`${dirname.root}time/nmf/topic`);

	exec(`docker run -i --rm -v ${process.cwd()}:/tmp r-nmf R --vanilla --slave --args tmp/${dirname.root}time/tfidf.csv tmp/${dirname.root}time/nmf/w.csv tmp/${dirname.root}time/nmf/h.csv ${params.number.divide} ${params.number.topic} < ${dirname.r}nmf.R`);
	exec(`docker run -i --rm -v ${process.cwd()}:/tmp r-nmf R --vanilla --slave --args tmp/${dirname.root}time/nmf/w.csv tmp/${dirname.root}time/nmf/w_s.csv ${params.number.topic} < ${dirname.r}sort.R`);
	exec(`docker run -i --rm -v ${process.cwd()}:/tmp r-nmf R --vanilla --slave --args tmp/${dirname.root}time/nmf/w_s.csv tmp/${dirname.root}time/nmf/topic/topic_ ${params.number.topic} < ${dirname.r}extract.R`);
};
