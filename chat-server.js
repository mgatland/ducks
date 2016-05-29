// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

process.title = 'node-chat';
var express = require("express");
var app = express();
var port = process.env.PORT || 8080;

var io = require('socket.io')({
    //Force xhr-polling, this means no websockets (because appfog doesn't support websockets)
  transports: ["xhr-polling"],
  "polling duration": 10
}).listen(app.listen(port));

console.log("listening on port " + port);

var shared = require('./shared/shared');
var profanity = require('./server/profanity');

//consts
var moveDelay = shared.moveDelay;

//globals
var history = [ ]; //totally unused
var users = [ ];
var lurkers = [ ];
var spies = [];

var kickedIps = [];

var potStuff = [];

function log(message) {
    console.log(message);
    var chatObj = {author:"#", text:message};
    history.push(chatObj);
    history = history.slice(-100);
    spies.forEach(function (usr) {
        usr.socket.emit("spy", [chatObj]);
    });
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var echoMap = new shared.Pos(11,11);
var echoPos = new shared.Pos(6, 8);
var echoReturnMap = new shared.Pos(11,16);

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

app.get('/spy.html', function (req, res) {
  res.sendfile(__dirname + '/spy.html');
});

app.use("/client", express.static(__dirname + '/client'));
app.use("/shared", express.static(__dirname + '/shared'));

//admin password
var password;
if (process.env.adminpw !== undefined) {
    password = process.env.adminpw;
} else {
    password = "a";
}

//email - old version which works locally but not on Heroku, connects directly to Gmail with username+password
/*
var sendEmail;
if (process.env.emailpw !== undefined) {
    console.log("enabling email");
    var email = require('./node_modules/emailjs/email');

    var mailserver  = email.server.connect({
       user:    "ducksalerts@gmail.com", 
       password: process.env.emailpw, 
       host:    "smtp.gmail.com", 
       ssl:     true
    });

    sendEmail = function (message) {
        mailserver.send({
           text:    message, 
           from:    "Ducks Alerts <ducksalerts@gmail.com>", 
           to:      "Matthew Gatland <support@matthewgatland.com>",
           subject: "ducks"
        }, function(err, message) { console.log(err || message); });  
    }
} else {
    console.log("WARNING: Email is disabled");
    var mailserver = {};
    sendEmail = function (message) {
        console.log("(email is disabled)");
    }
}*/

//new email, using a 3rd party service.
var sendEmail;
var sendgrid_api_key = process.env.sendgrid_api_key;
if (sendgrid_api_key) {
    var sendgrid  = require('sendgrid')(sendgrid_api_key);
    var sendEmail = function (message) {
        sendgrid.send({
          to:       'Matthew Gatland <support@matthewgatland.com>',
          from:     'Ducks Alerts <hi+ducks@mgatland.com>',
          subject:  'ducks',
          text:     message
        }, function(err, json) {
          if (err) { return console.error(err); }
          console.log(json);
        });
    }
} else {
    sendEmail = function (message) {
        console.log("(email is disabled)");
    }
}




io.sockets.on('connection', function (socket) {

    var client_ip = getClientIp(socket);
    if (kickedIps.indexOf(client_ip) >= 0) {
        log("Kicked user " + client_ip + " tried to rejoin");
        socket.emit('updatechat', { type: 'servermessage', data: { text: 'Sorry, you have been banned. Try again tomorrow.'} });
        setTimeout(function () {
            socket.disconnect(true);
        }, 5000);
        return;
    }

    var user = {};
    user.socket = socket;
    user.ip = client_ip;
    user.pos = new shared.Pos(5,5);
    user.name = false;
    user.color = false;
    user.moved = false;
    user.act = false;
    user.queuedMoves = [];
    user.map = shared.startingPos();
    user.diveMoves = 0;
    user.secrets = {}; //not replicated
    user.isReal = function() {
        return !(this.name === false);
    }
    lurkers.push(user);
 
    console.log(getTimestamp() + ' Connection accepted. ' + lurkers.length + " lurkers.");
 
    sendNetUsersTo(user.socket);

    var cursedMessages = ["woof woof!", "i'm so happy!", "hey everyone i found a secret", "meet me by the fountain", "dinosaur rawr!"];

    socket.on('sendchat', function (data) {
        var cursed = user.item === "curse";
        data = data.toLowerCase();
        console.log(getTimestamp() + " " 
                    + user.name + ': ' + data + (cursed ? " (CURSED)" : ""));

        if (cursed) {
            data = cursedMessages[Math.floor(Math.random()*cursedMessages.length)];
        }

        var obj = makeChatObject(user.name, user.color, data, user.map);
        addMessage(obj, user);

        if (data === "quack" || data === "dive" || data === "nap" || data === "look") {
            user.socket.emit('updatechat', { type: 'servermessage', data: { text: 'Try putting a slash in front like this: /' + data} });
        }
    });

    socket.on('spy', function(msg) {
        console.log('new spy');
        var index = shared.getIndexOfUser(user.name, lurkers);
        lurkers.splice(index, 1);
        spies.push(user);
        user.isSpy = true;
        socket.emit('spy', history);

        //only for spies
        socket.on("kick", function(msg) {
            kickUser(msg);
        })
    });

    socket.on('adduser', function(username){
        if (user.isReal()) {
            return;
        }

        username = htmlEntities(username).toLowerCase();

        if (username.length > 10) {
            username = username.substring(0,8) + "~1";
        }

        //prevent duplicate usernames.
        while (shared.getIndexOfUser(username, users) !== null) {
            console.log("duplicate username " + username);
            var num = parseInt(username.slice(-1), 10);
            //if it has a number, increment it
            if (isNaN(num)) {
                username = username.substring(0,8) + "~1";
            } else if (num === 9) {
                //just give up and let it get longer.
                username = "_" + username;
            } else {
                username = username.slice(0, -1) + (num + 1);
            }
        }

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

        var logMsg = "New user " + user.name + " with IP " + user.ip;
        log(logMsg);
        sendEmail(logMsg);
    });

    socket.on('cmd', processCommand);

    socket.on('disconnect', function(){
        console.log(getTimestamp() + user.name + " disconnected.");
        if (user.isReal()) {
            unusedColors.push(user.color);
            sendServerMessage(socket.broadcast, user.name + ' disappeared.');
            socket.broadcast.emit('updatechat', { type: 'playerleaves', data: user.name });
            var index = shared.getIndexOfUser(user.name, users);
            log("user " + user.name + " logged off");
            users.splice(index, 1);
        } else if (user.isSpy) {
            var index = shared.getIndexOfUser(user.name, spies);
            spies.splice(index, 1);
            console.log("removed a spy");
        } else {
            var index = shared.getIndexOfUser(user.name, lurkers);
            lurkers.splice(index, 1);
            console.log("Removed a lurker, " + lurkers.length + " remain.");
        }
    });

    function parseIntOrZero(string) {
        var num = parseInt(string, 10);
        if (isNaN(num)) return 0;
        return num;
    }

    function processCommand(message) {
        var fullMessage = message;
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

        if (user.name === "pi") {
            var args = fullMessage.split(" ");
            switch (message) {
                case 'map':
                    user.map.x = parseIntOrZero(args[1]);
                    user.map.y = parseIntOrZero(args[2]);
                    netUpdate = true;
                    moved = true;
                    break;
                case 'go':
                    user.pos.x = parseIntOrZero(args[1]);
                    user.pos.y = parseIntOrZero(args[2]);
                    netUpdate = true;
                    moved = true;
                    break;
                case 'info':
                    sendServerMessage(user.socket, "At " + user.map.x + "," + user.map.y);             
            }
        }

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
                user.item = "curse";
                log(user.name + " got cursed");
                sendServerMessage(user.socket, "You feel strange");
                break;
            case 'quack':
                if (user.diveMoves > 0) {
                    var quackObj = makeChatObject(user.name, user.color, "glub glub glub", user.map);
                    addMessage(quackObj);
                } else {
                    netUpdate = moveDuck(0,0,'quack');
                    var quackObj = makeChatObject(user.name, user.color, "QUACK!", user.map);
                    addMessage(quackObj);
                    if (shared.posAreEqual(user.map, echoMap)) {
                        //there's an echo soon after.
                        var dist = shared.distanceBetweenPos(user.pos, echoPos);
                        var msg = null;
                        if (dist == 0) {
                            netUpdate = true;
                            moved = true;
                            user.map.x = 10;
                            user.map.y = 15;
                            user.pos.x = 5;
                            user.pos.y = 5;
                            log(user.name + " fell through sand");
                            sendServerMessage(user.socket, "You fall through sand");
                        } else if (dist <= 2) {
                            msg = "QUACK!!!";
                        } else if (dist <= 4) {
                            msg = "QUACK!!";
                        } else if (dist <= 6) {
                            msg = "QUACK!";
                        } else if (dist <= 8) {
                            msg = "QUACK";
                        } else {
                            msg = "...";
                        }
                        if (msg != null) {
                                setTimeout(function () {
                                var echoObj = makeChatObject("echo", "#660066", msg, echoMap);
                                addMessage(echoObj);
                            }, 200);
                        }
                    }
                    if (shared.posAreEqual(user.map, echoReturnMap)) {
                        netUpdate = true;
                        moved = true;
                        user.map.x = 10;
                        user.map.y = 11;
                        user.pos.x = 5;
                        user.pos.y = 5;
                        log(user.name + " returned from echo world");
                        sendServerMessage(user.socket, "You fall through sand");
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
                        if (user.item === "curse" && lookFind.item === "red apple") {
                            sendServerMessage(user.socket, "You eat it and feel better!");
                            user.item = null;
                            user.secrets.curseGiver = null;
                            netUpdate = true;
                            log(user.name + " cured curse with apple");
                        } else if (user.item === "curse") {
                            sendServerMessage(user.socket, "You feel too strange to take it.");
                        } else if (user.item === lookFind.item) {
                            sendServerMessage(user.socket, "You already have that.");
                        } else if (user.item) {
                            sendServerMessage(user.socket, "You need to /drop your " + user.item + " first.");
                        } else {
                            user.item = lookFind.item;
                            netUpdate = true;
                            log(user.name + " found " + user.item);
                        }
                    }
                } else {
                    sendServerMessage(user.socket, "You find nothing.");
                }
                break;
            case 'drop':
                if (user.item === "curse") {
                    sendServerMessage(user.socket, "You have nothing to drop.");
                } else if (user.item) {
                    sendServerMessage(user.socket, "You drop " + user.item);
                    user.item = null;
                    netUpdate = true;
                } else {
                    sendServerMessage(user.socket, "You have nothing to drop.");
                }
                break;
            case 'add':
                //pot room
                if (shared.posIsAt(user.map, 09, 15)) {
                    if (user.item === "curse" || !user.item) {
                        sendServerMessage(user.socket, "You have nothing to add.");
                    } else if (potStuff.length < 2) {
                        sendServerMessage(user.socket, "You add " + user.item + " to the pot.");
                        log(user.name + " added " + user.item + " to the pot");
                        potStuff.push(user.item);
                        user.item = null;
                        netUpdate = true;
                    } else {
                        sendServerMessage(user.socket, "The pot was already full.");
                    }
                }
                break;
            case 'drink':
                //pot room
                if (shared.posIsAt(user.map, 09, 15)) {
                    if (potStuff.length < 2) {
                        sendServerMessage(user.socket, "It needs more ingredients before you can drink.");
                    } else if (user.item === "curse") {
                        sendServerMessage(user.socket, "You feel too strange to drink.");
                    } else if (user.item) {
                        sendServerMessage(user.socket, "You must /drop what you're holding before you can drink.");
                    } else {
                        //dirt, love note, violin, red apple, lizard, drum, grey apple
                        if (potStuff.indexOf("drum") >= 0 && potStuff.indexOf("love note") >= 0) {
                            user.hat = 2; //Amar's hat, for finding Amar's things
                        } else if (potStuff.indexOf("grey apple") >= 0 && potStuff.indexOf("red apple") >= 0) {
                            user.hat = 7; //apple hat
                        } else if (potStuff.indexOf("drum") >= 0 && potStuff.indexOf("violin") >= 0) {
                            user.hat = 4; //musical hat
                        } else if (potStuff.indexOf("red apple") >= 0 && potStuff.indexOf("lizard") >= 0) {
                            user.hat = 5; //delicious hat
                        } else if (potStuff.indexOf("lizard") >= 0) {
                            user.hat = 6;
                        } else if (potStuff.indexOf("grey apple") >= 0) {
                            user.hat = 3;
                        } else if (potStuff.indexOf("drum") >= 0) {
                            user.hat = 1;                            
                        } else {
                            user.hat = 0; //black hat is most common, i.e. dirt + dirt
                        }
                        log(user.name + " found hat " + user.hat);
                        potStuff = [];
                        
                        netUpdate = true;
                        //sendServerMessage(user.socket, "You drank the broth!");
                        var drinkMsg = makeChatObject(user.name, user.color, "drank the mixture!", user.map);
                        addMessage(drinkMsg);
                    }
                }
                break;
        }
        if (moved === true) {
            if (shared.isUserOnNote(user)) {
                displayNoteFor(user);
            }
            if (shared.isUserBelowNPC(user)) {
                displayNPCMessageFor(user);
                netUpdate = true; //Only because user inventory might change.
            }
            var noteCode = shared.getMapNoteForUser(user);
            if (noteCode !== null) {
                sendServerMessage(user.socket, getMapNote(noteCode));
            }
            if (user.item === "curse") {
                netUpdate = tryLoseCurse(user) || netUpdate;
            }
        }
        if (netUpdate === true) {
            var netUser = getNetUser(user);
            broadcast('playerUpdate', netUser);
            setTimeout(clearMove, moveDelay);           
        }
    }

    //return true if requires network update
    function tryLoseCurse (user) {
        var usersUnderMe = users.filter(function (other) {
            return (other !== user
                && shared.posAreEqual(user.map, other.map)
                && shared.posAreEqual(user.pos, other.pos));
        });
        if (usersUnderMe.length > 0) {
            var other = usersUnderMe.pop();
            if (other.item === 'curse') {
                return false;
            }
            if (user.secrets.curseGiver === other.name) {
                sendServerMessage(user.socket, "Can't give the curse back.");
                return false;
            }
            user.item = null;
            other.item = "curse";
            other.secrets.curseGiver = user.name;
            var otherNetUser = getNetUser(other);
            broadcast('playerUpdate', otherNetUser);
            sendServerMessage(other.socket, user.name + " put a curse on you :(");
            sendServerMessage(user.socket, "You put the curse on " + other.name);
            log(user.name + " cursed " + other.name);
            return true;
        }
        return false;
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
    mapNotes["cryptEntrance"] = "The treasures are missing";
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
        if (shared.posIsAt(user.map, 10, 10)) {
            return {message: "You found some dirt.", item: "dirt"};
        }
        if (shared.posIsAt(user.map, 11, 10)) {
            return {message: "You found a love note!", item: "love note"};
        }
        if (shared.posIsAt(user.map, 11, 11)) {
            return {message: "You found a violin.", item: "violin"};
        }
        if (shared.posIsAt(user.map, 9, 12)) {
            return {message: "You found a red apple.", item: "red apple"};
        }
        if (shared.posIsAt(user.map, 9, 10)) {
            return {message: "The chest is locked. From the inside?"};
        }
        if (shared.posIsAt(user.map, 12, 12)) {
            return {message: "You catch a forest lizard.", item: "lizard"};
        }

        //echo world
        if (shared.posIsAt(user.map, 10, 15)) {
            return {message: "You found some dirt.", item: "dirt"};
        }
        if (shared.posIsAt(user.map, 11, 15)) {
            return {message: "You found a drum.", item: "drum"};
        }
        if (shared.posIsAt(user.map, 9, 17)) {
            return {message: "You found a grey apple.", item: "grey apple"};
        }
        if (shared.posIsAt(user.map, 9, 15)) {
            //chest room
            if (potStuff.length === 2) {
                return {message: "The pot has boiled " + potStuff[0] + " and " + potStuff[1] + ". Maybe /drink it!"};
            } else if (potStuff.length === 1) {
                return {message: "The pot has boiled " + potStuff[0] + ". You can /add one more thing."};
            } else {
                return {message: "The pot is empty. You can /add something if you have something."};
            }
        }
    }

    var notes = {};

    notes['10:10'] = "~happy holidays~ be careful where you quack this summer!"; //the 'news' post

    notes['9:10'] = "Feeling sleepy? Take a /nap";
    notes['11:10'] = "Type /quack to quack!";
    notes['9:11'] = "It's hot here! A /dive would be nice.";
    notes['12:12'] = "Type /look to find items";

    //echo world
    notes['9:15'] = "stay here forever."; 
    notes['11:15'] = "there is no future.";
    notes['9:16'] = "cold water is cold.";

    //max 15 characters * 3 lines
    //123456789012345\n123456789012345\n123456789012345
    var npc = {};
    npc["13:10"] = function (user) {
        if (!user.secrets.gaveViolin) {
            if (user.item === "violin") {
                user.item = null;
                user.secrets.gaveViolin = true;
                return "MY VIOLIN!\nA GIFT FROM THE\nLOST BROTHERS";
            } else {
                return "PLEASE LOOK FOR\nMY VIOLIN ITS\nBY SOME ROCKS";
            }  
        }
        if (user.item === "violin") {
            return "HEY YOU FOUND\nANOTHER VIOLIN!\n";
        } else if (user.item === "curse") {
            return "YOU ARE CURSED\nYOU NEED APPLE\nCAN YOU DIVE?";
        } else if (user.item === "dirt") {
            return "DIRT FROM OLD  \nTOWN HALL. IT  \nWAS NICE BEFORE.";
        } else if (user.item === "drum") {
            return "THIS DRUM SAYS \n'AMAR's DRUM!' \nSEE THE LABEL?";
        } else if (user.item === "grey apple") {
            return "GREY APPLES ARE\nOF ECHO WORLD. \nNOT VERY TASTY.";
        } else if (user.item === "lizard") {
            return "IS THAT A\nDELICIOUS\nLIZARD?";
        } else if (user.item === "red apple") {
            return "MY HUSBAND USED\nTO LOVE APPLES\nHE IS GONE NOW";
        } else if (user.item === "love note") {
            return "THE NOTE SAYS  \nANNA DUCK I ♥ U\nYRU IGNORING ME";
        } else {
            return "THERE ARE MANY\nSECRETS TO FIND\nIN DUCKTOWN.";
        }
    }
    npc["0:1"] = function (user, users) {

        if (user.item === "curse") {
            return "DON'T TOUCH ME\nYOU HAVE CURSE\nFACE";
        }

        if (user.item === "dirt" && !user.secrets.gaveDirt) {
            user.item = null;
            user.secrets.gaveDirt = true;
            return "THANK YOU FOR\nTHE DIRT NOW\nI'll SHARE MINE"
        }

        if (!user.secrets.gaveDirt) {
            return "BRING ME SOME\nDIRT AND I WILL\nTELL ALL";
        }

        if (user.item === "love note") {
            return "THAT NOTE IS IN\nAMAR DUCK's    \nWRITING!";
        }

        var roomsWithUsers = [];
        var gossips = [];
        users.forEach(function (other) {
            if (other === user) return; //no self-gossip
            if (other.item === "curse") {
                gossips.push(other.name + "\nis cursed!");
            }
            if (other.item === "red apple") {
                gossips.push(other.name + " \nhas a red apple!");
            }
            var room = other.map.x + other.map.y * 100;
            if (roomsWithUsers[room] === undefined) {
                roomsWithUsers[room] = [];
            }
            roomsWithUsers[room].push(other.name);
        });
        //Find people alone together.
        roomsWithUsers.forEach(function (names) {
            if (names.length === 2) {
                gossips.push(names[0] + " and\n" 
                    + names[1] + " are\nalone together!");
            }
        });
        if (users.length === 1) {
            gossips.push("YOU ARE THE\nONLY DUCK IN\nTOWN");
        };
        //less likely than other gossips
        if (Math.random()>0.33) {
            gossips.push("THOSE WHO SLEEP\nIN BAD PLACE\nARE LOST");
        } else if (Math.random()>0.33) {
            gossips.push("IF YOU FIND ANY\nGOSSIP, BRING  \nIT TO ME!");
        } else {
            gossips.push("A DUCK'S QUACK\nDOES NOT ECHO\nANYWHERE");
        }
        return gossips[Math.floor(Math.random()*gossips.length)];
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
        var npcMessage = npc[user.map.x + ":" + user.map.y](user, users);
        if (npcMessage) {
            sendNPCMessage(user.socket, npcMessage);
            console.log("npc to " + user.name + ": " + npcMessage.split("\n").join("\\n").toLowerCase());
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

    function kickUser(data) {
        var name = data.name;
        var pass = data.pass;
        if (pass != password) {
            log("Failed to kick " + name + " - wrong password.");
            return;
        }
        var kickedList = users.filter(function (other) {
            return (other.name === name);
        });
        if (kickedList.length != 1) {
            log("Failed to kick " + name + " - wrong name?");
            return;
        }

        var kicked = kickedList[0];

        kickedIps.push(kicked.ip);

        unusedColors.push(kicked.color);
        sendServerMessage(socket.broadcast, kicked.name + ' was kicked.');
        socket.broadcast.emit('updatechat', { type: 'playerleaves', data: kicked.name });
        var index = shared.getIndexOfUser(kicked.name, users);
        log("user " + kicked.name + '(' + kicked.ip + ') was kicked');
        users.splice(index, 1);
        kicked.socket.disconnect(true);
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
        netUser.dir = user.dir;
        netUser.hat = user.hat;
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

//user is optional. If present, the user will be sent
//the message before profanity filtering.
function addMessage(chatObj, user) {
    history.push(chatObj);
    history = history.slice(-100);

    var data = {};
    data.messages = [];
    data.messages.push(chatObj);

    var datagram = { type:"messages", data: data };

    //send to the author without profanity filtering.
    if (user) user.socket.emit('updatechat', datagram);

    chatObj.text = profanity.filter(chatObj.text);

    users.forEach(function (usr) {
        if (usr === user) return;
        var distance = chatObj.map ? shared.distanceBetweenPos(usr.map, chatObj.map) : 0;
        if (distance < 2) {
            usr.socket.emit('updatechat', datagram);    
        }
    });

    lurkers.forEach(function (usr) {
        var distance = chatObj.map ? shared.distanceBetweenPos(shared.startingPos(), chatObj.map) : 0;
        if (distance < 2) {
            usr.socket.emit('updatechat', datagram);
        }
    });

    spies.forEach(function (usr) {
        usr.socket.emit("spy", [chatObj]);
    });
}

function makeChatObject(name, color, message, map) {
    var obj = {
        text: htmlEntities(message),
        author: name,
        color: color,
        map: map
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

function getClientIp(clientSocket) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = clientSocket.handshake.headers['x-forwarded-for']
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // heroku guarantees the last entry is the real one. Others might be spoofed
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[forwardedIps.length - 1];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = clientSocket.handshake.address;
  }
  return ipAddress;
};


