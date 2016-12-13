'use strict'

var currentTab = 'corresp';

function init(){
	changeTabs(currentTab);

	d3.json('server/src/params.json', function(err, params){
		params = params.client;

		var form = document.getElementById('upload');
		form.addEventListener('submit', function(e){
			var div = document.getElementById('status');
			div.innerHTML = 'start';

			(document.getElementById('wc')).innerHTML = '';
			(document.getElementById('corresp')).innerHTML = '';

			e.preventDefault();

			var formData = new FormData(form);

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
						rowData: `server/res/files/${res.file.filename}/person/corresp/rscore.csv`
					});
				}
			};

			xhr.ontimeout = function(e){
				console.log(e);
			};

			xhr.open('post', '/upload');
			xhr.send(formData);
		});
	});
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
