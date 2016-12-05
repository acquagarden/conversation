'use strict'

var
	server = require('http').createServer(),
	express = require('express'),
	app = express(),
	fs = require('fs'),
	multer = require('multer'),
	parser = require('body-parser'),
	port = 3001;

app.use(express.static('app'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/server', express.static(__dirname + '/server'));
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

var upload = multer({ dest: __dirname + '/server/res/texts' });

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var execute = require(__dirname + '/server/src/js/execute');
app.post('/upload', upload.single('input_file'), function(req, res){
	if(typeof req.file | typeof req.body.parts === 'undefined') res.sendStatus(400);
	else{
		execute.exec({ file: req.file, parts: req.body.parts, divnumber: req.body.dividenumber, topicnumber: req.body.topicnumber });

		fs.readFile(`server/res/files/${req.file.filename}/nmf/h.csv`, function(err, data){
			if(err) throw err;

			data = data.toString().split('\n');
			for(var i = 0; i < data.length; i++)
				data[i] = data[i].split(',');
	
			var files = {};
			for(var i = 1; i < data.length; i++){
				if(!(/^topic/g).test(data[i][0])) continue;

				let ary = data[i].slice(1, data.length);
				let max = ary.indexOf(String(Math.max.apply(null, ary)));

				if(typeof files[max] === 'undefined') files[max] = [];

				files[max].push(`server/res/files/${req.file.filename}/nmf/topic/topic_${i}.csv`);
			}

			res.send(JSON.stringify({ file: req.file, files: files }));
		});
	}
});

server.on('request', app);
server.listen(process.env.PORT || port, function(){
	console.log(`server running at port : ${server.address().port}`);
});
