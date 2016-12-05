'use strict'

var
	fs = require('fs'),
	exec = require('child_process').execSync,
	divide = require(__dirname + '/divide');

exports.exec = function(params){
	var
		filename = params.file.filename,
		dirname = {
			texts: `./server/res/texts/`,
			res: `./server/res/files/${filename}/`,
			js: `${__dirname}/`,
			r: `${__dirname}/../R/`
		},
		parts = params.parts.isArray > 1 ? params.parts.join(',') : params.parts,
		divnumber = params.divnumber,
		topicnumber = params.topicnumber;

	fs.mkdirSync(`${dirname.res}`);
	fs.mkdirSync(`${dirname.res}remark`);

	divide.divide({
		inputName: `${dirname.texts}${filename}`,
		outputDir: `${dirname.res}remark/`,
		divnumber: divnumber
	});

	fs.mkdirSync(`${dirname.res}morpheme`);
	fs.mkdirSync(`${dirname.res}morpheme/xml`);

	(function(){
		var files = fs.readdirSync(`${dirname.res}remark`);
		for(var i in files)
			exec(`node ${dirname.js}morpheme.js ${dirname.res}remark/${files[i]} ${dirname.res}morpheme/xml/morpheme_${i}.xml`);
	})();

	fs.mkdirSync(`${dirname.res}morpheme/json`);

	(function(){
		var files = fs.readdirSync(`${dirname.res}morpheme/xml`);
		for(var i in files)
			exec(`node ${dirname.js}extract.js ${dirname.res}morpheme/xml/${files[i]} ${dirname.res}morpheme/json/morpheme_${i}.json ${parts}`);
	})();

	exec(`node ${dirname.js}table.js ${dirname.res}morpheme/json ./server/src/ignore.txt ${dirname.res}tabulation.csv`);

	exec(`R --vanilla --slave --args ${dirname.res}tabulation.csv ${dirname.res}tfidf.csv < ${dirname.r}tfidf.R`);

	fs.mkdirSync(`${dirname.res}nmf`);
	fs.mkdirSync(`${dirname.res}nmf/topic`);

	exec(`R --vanilla --slave --args ${dirname.res}tfidf.csv ${dirname.res}nmf/w.csv ${dirname.res}nmf/h.csv ${divnumber} ${topicnumber} < ${dirname.r}nmf.R`);
	exec(`R --vanilla --slave --args ${dirname.res}nmf/w.csv ${dirname.res}nmf/w_s.csv ${topicnumber} < ${dirname.r}sort.R`);
	exec(`R --vanilla --slave --args ${dirname.res}nmf/w_s.csv ${dirname.res}nmf/topic/topic_ ${topicnumber} < ${dirname.r}extract.R`);
};
