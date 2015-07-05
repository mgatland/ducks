"use strict";

var socket = undefined;
var port = "80";

function makeChatStyle(color) {
    return 'background-color: ' + color;
}

function addMessage(author, message, color, map) {
    var newMessage = document.createElement('div');
    var style = makeChatStyle(color);
    var div = document.querySelector(".logs");
    var mapString = map ? "<i>" + map.x + ":" + map.y + "</i>" : "";
    newMessage.innerHTML = '<span class="chatname" style="' + style + '">' + author + ':</span>'
         + mapString + ' <span class="chatmessage">' + message + '</span>';
    div.insertBefore(newMessage, null);
}

function connect() {
	console.log("connecting to port " + port);
	socket = io.connect("http://" + document.domain + ":" + port);

	socket.on('connect', function () {
		socket.emit("spy", "spy");
	});

	document.querySelector(".kick").addEventListener('click', function () {
		var name = document.querySelector(".name").value;
		var pass = document.querySelector(".password").value;
		addMessage("sent...");
		socket.emit("kick", {name:name, pass:pass});
	});

	function onData (data) {
		data.forEach(function (d) {
			addMessage(d.author, d.text, d.color, d.map);
		});
	}

	socket.on('spy', function(data) {
		onData(data);
	});
}
connect();