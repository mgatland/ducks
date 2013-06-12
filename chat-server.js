// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

process.title = 'node-chat';
var express = require("express");
var app = express();
var port = process.env.PORT || 80;
var io = require('socket.io').listen(app.listen(port));
console.log("listening on port " + port);

//globals
var history = [ ];
var unsentMessages = [ ];
var users = [ ];
 
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
 
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
//random order:
colors.sort(function(a,b) { return Math.random() > 0.5; } );

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.use("/client", express.static(__dirname + '/client'));

io.set('log level', 1); // reduce logging

io.sockets.on('connection', function (socket) {

    var user = {};
    user.socket = socket;
    user.pos = new Pos(0,0);
    user.name = false;
    user.color = false;
    user.moved = false;
    user.isReal = function() {
        return !(this.name === false);
    }
    var index = users.push(user) - 1;
 
    console.log((new Date()) + ' Connection accepted.');
 
    // send back chat history
    if (history.length > 0) {
        user.socket.emit({ type: history, data: history });
    }

    socket.on('sendchat', function (data) {

        console.log((new Date()) + ' Received a message from '
                    + user.name + ': ' + data);
        
        var obj = {
            time: (new Date()).getTime(),
            text: htmlEntities(data),
            author: user.name,
            color: user.color
        };
        history.push(obj);
        unsentMessages.push(obj);
        history = history.slice(-100);
    });

    socket.on('adduser', function(username){
        if (user.isReal()) {
            return;
        }
        console.log("setting name: " + username);
        user.name = username;
        user.color = colors.shift();
        user.socket.emit('updatechat', { type: 'servermessage', data: { text: 'You arrived in Duck Town.'} });
        socket.broadcast.emit('updatechat', { type: 'servermessage', data: { text: username + ' arrived in Duck Town.'} });
    });

    socket.on('cmd', function(message) {
        if (!user.isReal()) {
            return;
        }
        switch (message) {
            case 'east':
                if (user.moved === false) {
                    user.pos.x++;
                    user.moved = true;
                }
                break;
            case 'west':
                if (user.moved === false) {
                    user.pos.x--;
                    user.moved = true;
                }
                break;
            case 'north':
                if (user.moved === false) {
                    user.pos.y--;
                    user.moved = true;
                }
                break;
            case 'south':
                if (user.moved === false) {
                    user.pos.y++;
                    user.moved = true;
                }
                break;
        }
    });

    socket.on('disconnect', function(){
        if (user.isReal()) {
            console.log((new Date()) + " Peer "
                + user.name + " disconnected.");
            colors.push(user.color);
            socket.broadcast.emit('updatechat', { type: 'servermessage', data: { text: user.name + ' disappeared.' }});
        }
        users.splice(index, 1);
    });
});

setInterval(function(){
    for (var i=0; i < users.length; i++) {
        users[i].moved = false; //let me move again.
    }
    var state = {};
    state.messages = unsentMessages;
    state.users = users.map(function(user) {
        var netUser = {};
        netUser.name = user.name;
        netUser.pos = user.pos;
        netUser.color = user.color;
        return netUser;
    })
    broadcast("state", state);
    unsentMessages = [ ];
}, 1000/4);

function Pos(x, y) {
    this.x = x;
    this.y = y;

    this.toString = function() {
        return "(" + this.x + "," + this.y + ")";
    }
}

var ackData = {};
ackData.type = "ack";
var ackJson = JSON.stringify(ackData);

function ack(user) {
    user.connection.sendUTF(ackJson);
}

function broadcast(type, data) {
    // broadcast message to all connected users
    // each user also recieves their index into the array
    for (var i=0; i < users.length; i++) {
        data.yourIndex = i;
        var datagram = { type:type, data: data };
        users[i].socket.emit('updatechat', datagram);
    }
}