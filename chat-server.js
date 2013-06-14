// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

process.title = 'node-chat';
var express = require("express");
var app = express();
var port = process.env.PORT || 80;
var io = require('socket.io').listen(app.listen(port));
console.log("listening on port " + port);

var shared = require('./shared/shared');


//consts
var moveDelay = 1000/4;

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
app.use("/shared", express.static(__dirname + '/shared'));


io.set('log level', 1); // reduce logging

//Force xhr-polling, this means no websockets (because appfog doesn't support websockets)
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) {

    var user = {};
    user.socket = socket;
    user.pos = new Pos(0,0);
    user.name = false;
    user.color = false;
    user.moved = false;
    user.act = false;
    user.queuedMoves = [];
    user.isReal = function() {
        return !(this.name === false);
    }
    var index = users.push(user) - 1;
 
    console.log((new Date()) + ' Connection accepted.');
 
//    // send back chat history
 //   if (history.length > 0) {
 //       user.socket.emit({ type: history, data: history });
 //   }
    sendFullStateTo(user.socket);


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

        var netUser = getNetUser(user);
        broadcast('playerUpdate', netUser);

    });

    socket.on('cmd', processCommand);

    socket.on('disconnect', function(){
        console.log((new Date()) + " Peer "
            + user.name + " disconnected.");
        if (user.isReal()) {
            colors.push(user.color);
            socket.broadcast.emit('updatechat', { type: 'servermessage', data: { text: user.name + ' disappeared.' }});
            socket.broadcast.emit('updatechat', { type: 'playerleaves', data: user.name });
        }
        var index = shared.getIndexOfUser(user, users);
        users.splice(index, 1);
    });

    function processCommand(message) {
        console.log(message);
        if (!user.isReal()) {
            return;
        }
        if (user.moved === true) {
            user.queuedMoves.push(message);
            console.log("move queue ++ to " + user.queuedMoves.length);
            return;
        }
        var netUpdate = false;
        switch (message) {
            case 'east':
                netUpdate = moveDuck(1,0);
                break;
            case 'west':
                netUpdate = moveDuck(-1,0);
                break;
            case 'north':
                netUpdate = moveDuck(0,-1);
                break;
            case 'south':
                netUpdate = moveDuck(0,1);
                console.log(user.act);
                break;
            case 'quack':
                netUpdate = moveDuck(0,0,'quack');
                break;
        }
        if (netUpdate === true) {
            var netUser = getNetUser(user);
            broadcast('playerUpdate', netUser);
            setTimeout(clearMove, moveDelay);           
        }
    }

    function moveDuck(x, y, act) {
        act = typeof act !== 'undefined' ? act : false; //default arguments
        user.pos.x += x;
        user.pos.y += y;
        user.moved = true;
        user.act = act;
        return true;
    }

    function clearMove() {
        user.moved = false;
        if (user.queuedMoves.length > 0) {
            var oldMove = user.queuedMoves.shift();
            console.log(user.queuedMoves.length + " queued moves --");
            processCommand(oldMove);
        }
    }

});

setInterval(function(){
    if (unsentMessages.length === 0) {
        return;
    }
    var state = {};
    state.messages = unsentMessages;
    broadcast("messages", state);
    unsentMessages = [ ];
}, 1000/4);

function sendFullStateTo(socket) {
    var state = getFullState();
    var datagram = { type:'state', data: state };
    socket.emit("updatechat", datagram);
};

function getFullState() {
    var state = {};
    state.users = users.map( getNetUser );
    return state;    
}

function getNetUser (user) {
        var netUser = {};
        netUser.name = user.name;
        netUser.pos = user.pos;
        netUser.color = user.color;
        netUser.act = user.act;
        return netUser;
    }

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
    for (var i=0; i < users.length; i++) {
        //data.yourIndex = i;
        var datagram = { type:type, data: data };
        users[i].socket.emit('updatechat', datagram);
    }
}