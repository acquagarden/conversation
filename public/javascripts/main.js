'use strict'

var currentTab = 'corresp';

function init(){
	var div = document.getElementById('status');
	var socketio = io.connect('/');

	changeTabs(currentTab);

	d3.json('server/src/params.json', function(err, params){
		params = params.client;

		var form = document.getElementById('upload');
		form.addEventListener('submit', function(e){
			e.preventDefault();

			execAnalysis(params);
		});

		socketio.on('analysis', function(data){
			execAnalysis(params, data);
		});
	});

	var form2 = document.getElementById('changeRadius');
	form2.addEventListener('submit', function(e){
		e.preventDefault();

		var xhr = new XMLHttpRequest();

		xhr.onload = function(e){
			console.log(xhr.responseText);
		};

		var formData = new FormData(form2);

		xhr.open('post', '/changeRadius');
		xhr.send(formData);
	});

	socketio.on('connect', function(){
		div.innerHTML = 'connected server';
	});

	socketio.on('message', function(data){
		div.innerHTML = data.value;
	});

	var roomId = document.getElementById('input_roomId');
	var submit = document.getElementById('submit_roomId');
	submit.addEventListener('click', function(e){
		socketio.emit('room', { value: roomId.value });
		roomId.value = '';
	});
}

function execAnalysis(params, data){
	var div = document.getElementById('status');
	var form = document.getElementById('upload');

	div.innerHTML = 'start';
			(document.getElementById('wc')).innerHTML = '';
			(document.getElementById('corresp')).innerHTML = '';

			var formData = new FormData(form);

			if(typeof data !== 'undefined') formData.append('text', data.value);

			var xhr = new XMLHttpRequest();

			xhr.onload = function(e){
				if(xhr.status !== 200)
					div.innerHTML = `error : ${xhr.responseText}`;
				else{
					let res = JSON.parse(xhr.responseText);

					div.innerHTML = `filename : ${res.file.originalname}`;

					drawClouds({ topicfiles: res.topicfiles });
					drawCorresp({
						components: params.components,
						rowData: `server/res/files/${res.file.filename}/person/corresp/rscore.csv`,
						colData: `server/res/files/${res.file.filename}/person/corresp/cscore.csv`
					});
				}
			};

			xhr.ontimeout = function(e){
				console.log(e);
			};

			xhr.open('post', '/upload');
			xhr.send(formData);
}

function getSize(id){
	var e = document.getElementById(id);

	return {
		width: Number(window.getComputedStyle(e, null).width.match(/\d+(\.\d+)?/g)),
		height: Number(window.getComputedStyle(e, null).height.match(/\d+(\.\d+)?/g))
	};
}

function changeTabs(id){
	document.getElementById('wc').style.display = 'none';
	document.getElementById('corresp').style.display = 'none';

	document.getElementById(id).style.display = 'block';
	currentTab = id;
}

function drawClouds(params){
	var keys = Object.keys(params.topicfiles);
	for(var i of keys){
		var clouds = new Clouds({
			time: { size: keys.length, index: i},
			topicfiles: params.topicfiles[i]
		}).draw();
	}
}
