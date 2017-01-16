'use strict'

var
	socketio,
	editor1,
	editor2,
	info,
	information,
	room = null,
	conn = null,
	peer = null;

function init(){
	editor1 = document.getElementById('editor1');
	editor2 = document.getElementById('editor2');
	info = document.getElementById('info');
	information = document.getElementById('information');

	//if(document.cookie !== '' && typeof document.cookie !== 'undefined') push(editor1, decodeURIComponent(document.cookie.split('=')[1]), false);
	var storage = localStorage;
	if(typeof storage.data !== 'undefined')
		push(editor1, decodeURIComponent(storage.data), false);

	pushHTML(information, '[esc] [esc] [esc] : キー登録');
	pushHTML(information, '<br />');

	socketio = io.connect('/');
	socketio.on('connect', function(){
		pushHTML(information, 'connected to server');
	});

	socketio.on('message', function(data){
		pushHTML(information, data.value);
	});

	socketio.on('mirror', function(data){
		push(editor1, data.value, false);
	});

	socketio.on('common', function(data){
		push(editor2, data.value, true);
	});

	Mousetrap.bind('enter', function(e){
		return false;
	});

	Mousetrap.bind(['N', 'C', 'R'], function(e){
		return false;
	});

	Mousetrap.bind('shift+r shift+r shift+r', function(e){
		conn = null;
		peer = null;
	});

	Mousetrap.bind('esc esc esc', function(e){
		pushHTML(information, 'recording...');
		push(editor2, '', false);

		Mousetrap.record(function(seq){
			push(editor2, `${seq.join(' ')}:`, false);
			editor2.focus();

			Mousetrap.bind('esc+enter', function(e){
				var bind = editor2.value.split(':');

				Mousetrap.bind(bind[0], function(e){
					setPerson(bind[1]);
					editor2.focus();
					return false;
				});

				Mousetrap.unbind('esc+enter');

				pushHTML(information, `set [${bind[0]}] to ${bind[1]}`);
				push(editor2, '', false);

				info.innerHTML += `<p>[${bind[0]}] : ${bind[1]}</p>`;

				return false;
			});
		});
	});

	var submit = document.getElementById('text_submit');
	submit.addEventListener('click', function(e){
		socketio.emit('analysis', { room: room, value: editor1.value });
	});

	var enter = document.getElementById('enter_room');
	enter.addEventListener('click', function(e){
		if(room === null){
			room = editor2.value;
			editor2.value = '';
			info.innerHTML += `<p>room : ${room}</p>`;

			socketio.emit('room', { value: room });
		}
	});
	
	var snd = document.getElementById('stand_peer');
	snd.addEventListener('click', function(e){
		if(peer === null){
			peer = new Peer(editor2.value, {key: 'jmmr2bpvh2d18aor'});
			pushHTML(information, `create peer : ${editor2.value}`);
			push(editor2, '', false);

			peer.on('error', function(e){
				pushHTML(information, `error : ${e.message}`);
			});
		}
		if(conn === null) stand();
	});

	var con = document.getElementById('connect_peer');
	con.addEventListener('click', function(e){
		if(conn === null) connect();
	});

	var save = document.getElementById('save');
	save.addEventListener('click', function(e){
		//document.cookie = `data=${encodeURIComponent(editor1.value)}`;
		storage.setItem('data', encodeURIComponent(editor1.value));
		pushHTML(information, 'saved');
	});

	var mirror = document.getElementById('mirror');
	mirror.addEventListener('click', function(e){
		socketio.emit('mirror', { room: room, value: editor1.value });
	});
}

function stand(){
	pushHTML(information, 'stand...');

	peer.on('connection', function(c){
		conn = c;
		pushHTML(information, `connected : ${conn.peer}`);

		conn.on('data', function(data){
			push(editor1, data, true);
		});

		conn.on('close', function(){
			pushHTML(information, 'closed connection');
			conn = null;
		});
	});
}

function connect(id){
	var c = peer.connect(editor2.value);
	pushHTML(information, 'connection started...');

	c.on('open', function(){
		conn = c;
		pushHTML(information, `connected : ${conn.peer}`);
		push(editor2, '', false);

		conn.on('data', function(data){
			push(editor1, data, true);
		});
	});

	c.on('close', function(){
		pushHTML(information, 'closed connection');
		conn = null;
	});
}

function push(editor, text, flag){
	if(flag) editor.value += `${editor.value === '' ? '' : '\n'}${text}`;
	else editor.value = text;
	editor.scrollTop = editor.clientHeight - editor.scrollTop;
}

function pushHTML(element, text){
	element.innerHTML += `<p>${text}</p>`;
}

function setPerson(person){
	if(editor2.value === '') push(editor2, `${person}:`, false);
	else{
		if(/^(.+:)$/.test(editor2.value)){
			push(editor2, `${person}:`, false);
			return;
		}
		if(/^(.+:.+)/.test(editor2.value)){
			if(conn !== null) conn.send(editor2.value);
			push(editor1, editor2.value, true);
			push(editor2, `${person}:`, false);
		}
	}
}
