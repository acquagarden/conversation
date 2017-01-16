'use strict'

var
	server = require('http').createServer(),
	express = require('express'),
	app = express(),
	fs = require('fs'),
	multer = require('multer'),
	parser = require('body-parser'),
	socketio = require('socket.io'),
	port = 3001;

app.use(express.static('app'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/server', express.static(__dirname + '/server'));
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

var upload = multer({ dest: __dirname + '/server/res/texts' });

var params = (function(path){
	var params = JSON.parse(fs.readFileSync(path)).server;

	return {
		get: function(key){ return typeof key === 'undefined' ? params : params[key]; },
		set: function(param){
			var keys = Object.keys(param);
			for(var key of keys)
				params[key] = param[key];	
		}
	}
})('server/src/params.json');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/editor', function(req, res){
	res.sendFile(__dirname + '/editor.html');
});

app.post('/changeRadius', function(req, res){
	res.send(req.body.radius);
});

app.post('/emit', function(req, res){
	io.sockets.emit('common', { value: req.body.data });
	res.sendStatus(200);
});

var execute = require(__dirname + '/server/src/js/execute');
app.post('/upload', upload.single('input_file'), function(req, res){
	if(typeof req.file & req.body.text | typeof req.body.parts === 'undefined') res.sendStatus(400);
	else{
		if(typeof req.body.text !== 'undefined'){
			var now = Date.now();

			fs.writeFileSync(`server/res/texts/${String(now)}`, req.body.text);

			req.file = {
				filename: now
			};
		}

		params.set({
			file: req.file,
			parts: req.body.parts.isArray > 1 ? req.body.parts.join(',') : req.body.parts,
			number: {
				divide: req.body.divide,
				topic: req.body.topic
			}
		});
			
		execute.exec(params.get());

		fs.readFile(`server/res/files/${req.file.filename}/time/nmf/h.csv`, function(err, data){
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

				files[max].push(`server/res/files/${req.file.filename}/time/nmf/topic/topic_${i}.csv`);
			}

			params.set({
				topicfiles: files
			});
			
			res.send(JSON.stringify(params.get()));
		});
	}
});

server.on('request', app);
server.listen(process.env.PORT || port, function(){
	console.log(`server running at port : ${server.address().port}`);
});

var io = socketio.listen(server);

io.on('connection', function(socket){
	console.log(`connected [${socket.id}]`);

	socket.on('room', function(data){
		socket.join(data.value);
		socket.emit('message', { value: `joined to room [${data.value}]` });
	});

	socket.on('message', function(data){
		io.to(data.room).emit('message', { value: data.value });
	});

	socket.on('analysis', function(data){
		io.to(data.room).emit('analysis', { value: data.value });
	});

	socket.on('mirror', function(data){
		io.to(data.room).emit('mirror', { value: data.value });
	});
});
