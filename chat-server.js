// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";
 
// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';
 
// Port where we'll run the websocket server
var webSocketsServerPort = 80;
 
// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
 
/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
var unsentMessages = [ ];
var users = [ ];
 
/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
 
// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );
 
/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});
 
/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});
 
// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
 
    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event

    var user = {};
    user.connection = connection;
    user.pos = new Pos(0,0);
    user.name = false;
    user.color = false;

    var index = users.push(user) - 1;
 
    console.log((new Date()) + ' Connection accepted.');
 
    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }
 
    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text

            var json = JSON.parse(message.utf8Data);

            if (user.name === false) { // first message sent by user is their name
                // remember user name
                user.name = htmlEntities(json.msg);
                // get random color and send it back to the user
                user.color = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: user.color }));
                console.log((new Date()) + ' User is known as: ' + user.name
                            + ' with ' + user.color + ' color.');
 
            } else if (json.type === 'cmd') {
                switch (json.msg) {
                    case 'east':
                        user.pos.x++;
                        break;
                    case 'west':
                        user.pos.x--;
                        break;
                    case 'north':
                        user.pos.y--;
                        break;
                    case 'south':
                        user.pos.y++;
                        break;
                }
                ack(user);
            } else { // log and broadcast the message
                console.log((new Date()) + ' Received a message from '
                            + user.name + ': ' + message.utf8Data);
                
                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(json.msg),
                    author: user.name,
                    color: user.color,
                    pos: user.pos
                };
                history.push(obj);
                unsentMessages.push(obj);
                history = history.slice(-100);
                //broadcast('message', obj);
                ack(user);
            }
        }
    });
 
    // user disconnected
    connection.on('close', function(connection) {
        if (user.name !== false && user.color !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            users.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(user.color);
        }
    });
});

setInterval(function(){
    for (var i=0; i < users.length; i++) {
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
    }
}, 1000/2);

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
    //HACK: tell the user what their index is in the users array (hack because broadcast is used for non user data)
    for (var i=0; i < users.length; i++) {
        data.yourIndex = i;
        var json = JSON.stringify({ type:type, data: data });
        users[i].connection.sendUTF(json);
    }
}