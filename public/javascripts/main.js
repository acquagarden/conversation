'use strict'

function init(){
	var form = document.getElementById('upload');

	form.addEventListener('submit', function(e){
		var div = document.getElementById('status');
		div.innerHTML = 'start';

		(document.getElementById('wc')).innerHTML = '';

		e.preventDefault();

		var formData = new FormData(form);

		var xhr = new XMLHttpRequest();

		xhr.onload = function(e){
			if(xhr.status !== 200)
				div.innerHTML = `error : ${xhr.responseText}`;
			else{
				let res = JSON.parse(xhr.responseText);

				div.innerHTML = `filename : ${res.file.originalname}`;
				drawClouds(res);
			}
		};

		xhr.ontimeout = function(e){
			console.log(e);
		};

		xhr.open('post', '/upload');
		xhr.send(formData);
	});
}

function getSize(id){
	var e = document.getElementById(id);

	return {
		width: Number(window.getComputedStyle(e, null).width.match(/[0-9]+/g)),
		height: Number(window.getComputedStyle(e, null).height.match(/[0-9]+/g))
	};
}

function drawLine(res){
	var size = getSize('wc');

	var keys = Object.keys(res.files);
	for(var i of keys){
		var carray = [
			[0, size.height/keys.length*(Number(i)+1)],
			[size.width, size.height/keys.length*(Number(i)+1)]
		];
		console.log(i+1);

		var line = d3.line()
			.x(function(d){ return d[0]; })
			.y(function(d){ return d[1]; });

		d3.select('svg')
			.append('path')
			.attr('d', line(carray))
			.attr('stroke', 'lightgreen')
			.attr('stroke-width', 5);
	}
}

function drawClouds(res){
	var keys = Object.keys(res.files);
	for(var i of keys){
		var clouds = new Clouds({
			time: { size: keys.length, index: i},
			files: res.files[i]
		}).draw();
	}
}
