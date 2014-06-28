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
var history = [ ]; //totally unused
var users = [ ];
var lurkers = [ ];

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var echoMap = new shared.Pos(11,11);

var colors = [  //in order of attractiveness
    '#fff8bc', //white
    '#dda0dd', //light pink
    '#ffa500',  //orange
    '#8effc1', //light green
    '#ff0000', //red
    '#2badff', //blue
    '#008000', //green
    '#800080', //maroon
    '#ff00ff', //bright pink
    '#7f3300' // brown
    ];

var unusedColors = colors.slice(0);

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
    user.pos = new shared.Pos(5,5);
    user.name = false;
    user.color = false;
    user.moved = false;
    user.act = false;
    user.queuedMoves = [];
    user.map = shared.startingPos();
    user.diveMoves = 0;
    user.isReal = function() {
        return !(this.name === false);
    }
    lurkers.push(user);
 
    console.log(getTimestamp() + ' Connection accepted. ' + lurkers.length + " lurkers.");
 
    sendNetUsersTo(user.socket);

    socket.on('sendchat', function (data) {
        data = data.toLowerCase();
        console.log(getTimestamp() + ' > '
                    + user.name + ': ' + data);        
        var obj = makeChatObject(user.name, user.color, data);
        addMessage(obj);

        if (data === "quack" || data === "dive" || data === "nap") {
            user.socket.emit('updatechat', { type: 'servermessage', data: { text: 'Try putting a slash in front like this: /' + data} });
        }
    });

    socket.on('adduser', function(username){
        username = htmlEntities(username).toLowerCase();
        if (user.isReal()) {
            return;
        }

        //prevent duplicate usernames.
        while (shared.getIndexOfUser(username, users) !== null) {
            console.log("duplicate username " + username);
            username = "_" + username + "_";
        }

        console.log("setting name: " + username);
        user.name = username;
        if (unusedColors.length === 0) {
            //This allows duplicate colors for ever, but I don't mind.
            //ideally we would issue a random color from the set of "least used colors"
            //which means maintaining a use-count for each color
            unusedColors = colors.slice(0);
        }
        user.color = unusedColors.shift();
        
        users.push(user);
        var index = shared.getIndexOfUser(user.name, lurkers);
        lurkers.splice(index, 1);

        user.socket.emit('updatechat', { type: 'servermessage', data: { text: 'You arrived in Duck Town.'} });

        user.socket.emit('updatechat', { type: 'loggedin', data: { name: user.name, color: user.color } });

        socket.broadcast.emit('updatechat', { type: 'servermessage', data: { text: user.name + ' arrived in Duck Town.'} });

        var netUser = getNetUser(user);
        broadcast('playerUpdate', netUser);

    });

    socket.on('cmd', processCommand);

    socket.on('disconnect', function(){
        console.log(getTimestamp() + " Peer "
            + user.name + " disconnected.");
        if (user.isReal()) {
            unusedColors.push(user.color);
            sendServerMessage(socket.broadcast, user.name + ' disappeared.');
            socket.broadcast.emit('updatechat', { type: 'playerleaves', data: user.name });
            var index = shared.getIndexOfUser(user.name, users);
            console.log("removing user " + user.name);
            users.splice(index, 1);
        } else {
            var index = shared.getIndexOfUser(user.name, lurkers);
            lurkers.splice(index, 1);
            console.log("Removed a lurker, " + lurkers.length + " remain.");
        }
    });

    function processCommand(message) {
        message = message.toLowerCase();
        //remove everything after a space
        if (message.indexOf(" ") !== -1) {
            message = message.substring(0, message.indexOf(" "));
        }
        if (!user.isReal()) {
            return;
        }
        if (user.moved === true) {
            user.queuedMoves.push(message);
            if (user.queuedMoves.length > 1) {
                console.log("move queue: " + user.queuedMoves.length);
            }
            return;
        }
        var netUpdate = false;
        var moved = false;
        switch (message) {
            case 'east':
                netUpdate = moveDuck(1,0);
                moved = true;
                break;
            case 'west':
                netUpdate = moveDuck(-1,0);
                moved = true;
                break;
            case 'north':
                netUpdate = moveDuck(0,-1);
                moved = true;
                break;
            case 'south':
                netUpdate = moveDuck(0,1);
                moved = true;
                break;
            case 'wilberforce':
                netUpdate = true;
                moved = true;
                user.map.x = 10;
                user.map.y = 8;
                user.pos.x = 5;
                user.pos.y = 5;
                break;
            case 'quack':
                if (user.diveMoves > 0) {
                    var quackObj = makeChatObject(user.name, user.color, "glub glub glub");
                    addMessage(quackObj);
                } else {
                    netUpdate = moveDuck(0,0,'quack');
                    var quackObj = makeChatObject(user.name, user.color, "QUACK!");
                    addMessage(quackObj);
                    if (shared.posAreEqual(user.map, echoMap)) {
                        //there's an echo one second later.
                        setTimeout(function () {
                            var echoObj = makeChatObject("echo", "#660066", "QUACK!");
                            addMessage(echoObj);
                        }, 1000);
                    }
                }
                break;
            case 'dive':
                if (user.diveMoves > 0 && shared.canSurface(user)) {
                    netUpdate = moveDuck(0,0);
                    if (netUpdate) {
                        user.diveMoves = 0;
                    }
                } else if (shared.isSwimming(user)) {
                    netUpdate = moveDuck(0,0);
                    if (netUpdate) {
                        user.diveMoves = 4;
                    }
                } else {
                    sendServerMessage(user.socket, "You can't dive right now.");
                }
                break;
            case 'sleep':
            case 'nap':
                if (user.diveMoves > 0) {
                    sendServerMessage(user.socket, "You can't nap underwater.");
                } else {
                    netUpdate = moveDuck(0,0,'nap');
                }
                break;
            case 'look':
                var lookFind = lookForStuff(user);
                if (lookFind) {
                    sendServerMessage(user.socket, lookFind.message);
                    if (lookFind.item) {
                        if (user.item === lookFind.item) {
                            sendServerMessage(user.socket, "You already have that.");
                        } else if (user.item) {
                            sendServerMessage(user.socket, "You need to /drop your " + user.item + " first.");
                        } else {
                            user.item = lookFind.item;
                            netUpdate = true;
                        }
                    }
                } else {
                    sendServerMessage(user.socket, "You find nothing.");
                }
                break;
            case 'drop':
                if (user.item) {
                    sendServerMessage(user.socket, "You drop " + user.item);
                    user.item = null;
                    netUpdate = true;
                } else {
                    sendServerMessage(user.socket, "You have nothing to drop.");
                }
                break;
        }
        if (moved === true) {
            if (shared.isUserOnNote(user)) {
                displayNoteFor(user);
            }
            if (shared.isUserBelowNPC(user)) {
                displayNPCMessageFor(user);
            }
            var noteCode = shared.getMapNoteForUser(user);
            if (noteCode !== null) {
                sendServerMessage(user.socket, getMapNote(noteCode));
            }
        }
        if (netUpdate === true) {
            var netUser = getNetUser(user);
            broadcast('playerUpdate', netUser);
            setTimeout(clearMove, moveDelay);           
        }
    }

    var mapNotes = [];
    mapNotes["crypt1"] = "CROWN OF DUCK PRINCE";
    mapNotes["crypt2"] = "CUTSMITH THE SWORD";
    mapNotes["crypt3"] = "SHOE OF LONGEST JOURNEY";
    mapNotes["crypt4"] = "(IT'S BLANK)";
    mapNotes["crypt5"] = "LUSTROUS EARRINGS";
    mapNotes["crypt6"] = "LARGE TOMATO";
    mapNotes["crypt7"] = "RING OF HOLDING";
    mapNotes["crypt8"] = "RARE COMIC BOOKS";
    mapNotes["cryptEntrance"] = "Old treasure room. The treasure is missing";
    mapNotes["statue1"] = "KING WALFRED DUCK I 107-143";
    mapNotes["statue2"] = "KING WALFRED DUCK II 128-202";
    mapNotes["statue3"] = "QUEEN PERSIMMON I 152-221";
    mapNotes["statue4"] = "MAYOR ROLLYDUCK WHO SOLVED THE INK CRISIS";
    mapNotes["statue5"] = "THE STRANGEST DUCK WHO SAVED US ALL";
    mapNotes["statue6"] = "ANNA DUCK WHO CURED THE DUCK PLAGUE";
    mapNotes["statue7"] = "THE LOST BROTHERS WE WILL NOT FORGET";

    function getMapNote(code) {
        return mapNotes[code];
    }


    function lookForStuff(user) {
        if (user.map.x === 10 && user.map.y === 10) {
            return {message: "You found some dirt.", item: "dirt"};
        }
    }

    var notes = {};
    notes['9:10'] = "Feeling sleepy? Take a /nap"; 
    notes['11:10'] = "Type /quack to quack!";
    notes['9:11'] = "It's hot here! A /dive would be nice.";

    //max 15 characters * 3 lines
    var npc = {};
    npc["13:10"] = function (user) {
        return "THE DARK RUINS\nWERE ONCE THE\nHEART OF TOWN";
    }

    function sendServerMessage(emitter, message) {
        emitter.emit('updatechat', { type: 'servermessage', data: { text: message }});
    }

    function sendNPCMessage(emitter, message) {
        emitter.emit('updatechat', { type: 'npc', data: { text: message }});
    }

    function displayNoteFor (user) {
        var note = notes[user.map.x + ":" + user.map.y];
        if (note) {
            sendServerMessage(user.socket, note);
        } else {
            console.log("Error: User found a missing note at map " + user.map.x + ":" + user.map.y);
        }
    }

    function displayNPCMessageFor (user) {
        var npcMessage = npc[user.map.x + ":" + user.map.y](user);
        if (npcMessage) {
            sendNPCMessage(user.socket, npcMessage);
        } else {
            console.log("Error: User found a glitched NPC at map " + user.map.x + ":" + user.map.y);
        }
    }

    function moveDuck(x, y, act) {
        act = typeof act !== 'undefined' ? act : false; //default arguments
        user.moved = true;
        shared.move(user, x, y);
        user.act = act;
        return true;
    }

    function clearMove() {
        user.moved = false;
        if (user.queuedMoves.length > 0) {
            var oldMove = user.queuedMoves.shift();
            processCommand(oldMove);
        }
    }

});

function sendNetUsersTo(socket) {
    var state = getAllNetUsers();
    var datagram = { type:'state', data: state };
    socket.emit("updatechat", datagram);
};

function getAllNetUsers() {
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
        netUser.map = user.map;
        netUser.item = user.item;
        if (user.diveMoves > 0) {
            netUser.diveMoves = user.diveMoves;
        }
        return netUser;
    }

var ackData = {};
ackData.type = "ack";
var ackJson = JSON.stringify(ackData);

function ack(user) {
    user.connection.sendUTF(ackJson);
}

function broadcast(type, data) {
    // broadcast message to all connected users
    var datagram = { type:type, data: data };
    for (var i=0; i < users.length; i++) {
        users[i].socket.emit('updatechat', datagram);
    }

    for (var i=0; i < lurkers.length; i++) {
        lurkers[i].socket.emit('updatechat', datagram);
    }
}

function addMessage(chatObj) {
    history.push(chatObj);
    history = history.slice(-100);

    var state = {};
    state.messages = [];
    state.messages.push(chatObj);
    broadcast("messages", state);
}

function makeChatObject(name, color, message) {
    var obj = {
        text: htmlEntities(message),
        author: name,
        color: color
    };
    return obj;
}

//convert single digit numbers to two digits
function d2(num) {
    if (num < 10) {
        return "0" + num
    }
    return "" + num;
}

function getTimestamp() {
    var d = new Date();
    return d.getFullYear() + "-" + d2(d.getMonth()) + "-" + d.getDate() + 
    " " + d2(d.getHours()) + ":" + d2(d.getMinutes()) + ":" + d2(d.getSeconds());
}