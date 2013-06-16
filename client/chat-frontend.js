var frontend = function () {
    "use strict";
 
    //get element by id
    function g (element) {
        return document.getElementById(element);
    }

    //data from the server
    var users;
    var keysDown = [];

    //stuff    
    var tileSize = 48; //16, 32, 48
    var screenWidth = 12;
    var screenHeight = 12;
    var duckImage = loadImage("/client/duck.png");
    var duckQuackImage = loadImage("/client/duck-quack.png");
    var brickImage = loadImage("/client/bricks0.png");
    var groundImage = loadImage("/client/ground0.png");
    var moved = false;
    var moveDelay = 1000/4;
    var map = shared.getMap();

    function loadImage(name)
    {
        // create new image object
        var image = new Image();
        // load image
        image.src = name;
        // return image object
        return image;
    }

    // for better performance - to avoid searching in DOM
    var content = g('chat');
    var input = g('input');
    var status = g('status');
 
    var canvas = g('gamescreen');
    var ctx = canvas.getContext("2d");
    canvas.width = screenWidth*tileSize;
    canvas.height = screenWidth*tileSize;
    
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    if (typeof KeyEvent == "undefined") {
        var KeyEvent = {
            DOM_VK_RETURN: 13,
            DOM_VK_ENTER: 14,
            DOM_VK_LEFT: 37,
            DOM_VK_UP: 38,
            DOM_VK_RIGHT: 39,
            DOM_VK_DOWN: 40,
        }
    }
    var port = "80";
    var socket = io.connect("http://" + document.domain + ":" + port); //document.domain or "ducks.hp.af.cm" 

    function forEachCell(map, func) {
        var pos = new shared.Pos(0,0);
        for (var i = 0; i < map.getWidth(); i ++) {
            for (var j = 0; j < map.getHeight(); j++) {
                pos.x = i;
                pos.y = j;
                func(map.get(pos), pos);
            }
        }
    }

    function drawEverything () {
        //draw the tiles
        var map = shared.getMap();
        //ctx.fillStyle = '#72D';
        forEachCell(map, function (tile, pos) {
            if (tile === 'x') {
                ctx.drawImage(brickImage, pos.x*tileSize,pos.y*tileSize,tileSize,tileSize);
            } else {
                ctx.drawImage(groundImage, pos.x*tileSize,pos.y*tileSize,tileSize,tileSize);
            }
        });

        users.forEach(function(user) {
            if (user.name != false) {
                ctx.fillStyle = user.color;
                ctx.fillRect(user.pos.x * tileSize-4, user.pos.y * tileSize-4, tileSize+8, tileSize+8);
                if (user.act === 'quack') {
                    ctx.drawImage(duckQuackImage, user.pos.x * tileSize, user.pos.y * tileSize);
                } else {
                    ctx.drawImage(duckImage, user.pos.x * tileSize, user.pos.y * tileSize);
                }
            }
        });
    }

    socket.on('connect', function () {
        // first we want users to enter their names
        //input.disabled = false;
        status.innerHTML = 'NAME:';
    });
 
   /* connection.onerror = function (error) {
        // just in there were some problems with connection...
        content.innerHTML = '<p>Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.</p>'; 
    };*/

    socket.on('updatechat', function (data) {
        if (data.type === 'state') { // world update
            console.log('recieved initial state');
            users = data.data.users;
            drawEverything();
        } else if (data.type === 'messages') {
            addMessages(data.data.messages);
        } else if (data.type === 'servermessage') {
            //input.disabled = false;
            addMessage('server', data.data.text, "#000", new Date());
        } else if (data.type === 'playerUpdate') {
            var updatedUser = data.data;
            //find the user to update in our array
            var index = shared.getIndexOfUser(updatedUser.name, users);
            if (index != null) {
                users[index] = updatedUser;
            } else {
                console.log("update for new user: " + updatedUser.name);
                users.push(updatedUser);
            }
            drawEverything();
        } else if (data.type === 'playerleaves') {
            var index = shared.getIndexOfUser(data.data, users);
            if (index) {
                users.splice(index, 1);
                drawEverything();
            }

        } else {
            console.log('Hmm..., I\'ve never seen data like this: ', data);
        }
    });

    function sendMessage(msg) {
        if (!msg) {
            return;
        }
        var type = null;
        var message = {};
        if (myName === false && msg.charAt(0) != '/') {
            type = "adduser";
            message = msg;
            myName = msg;
            console.log("Setting name");
            status.innerHTML = 'CHAT:';
        } else if (msg.charAt(0) === '/') {
            type = 'cmd';
            message = msg.substring(1);
        } else {
            type = 'sendchat';
            message = msg;
        }
        socket.emit(type, message);
    }

    function moveMyDuck(x, y) {
        var myIndex = shared.getIndexOfUser(myName, users);
        var myDuck = users[myIndex];
        shared.move(myDuck, x, y);
        moved = true;
        setTimeout(function(){
            moved = false;
        }, moveDelay);
        drawEverything();
    }

    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
        switch (e.keyCode) {

            case KeyEvent.DOM_VK_UP:
            case KeyEvent.DOM_VK_DOWN:
            case KeyEvent.DOM_VK_LEFT:
            case KeyEvent.DOM_VK_RIGHT:
            e.preventDefault();
        }
    }, false);

    addEventListener("keyup", function (e) {
        keysDown[e.keyCode] = false;
    }, false);

    setInterval(function() {
        if (moved === false) {
            if (keysDown[KeyEvent.DOM_VK_DOWN] === true) {
                sendMessage("/south");
                moveMyDuck(0,1);
            } else if (keysDown[KeyEvent.DOM_VK_UP] === true) {
                sendMessage("/north");
                moveMyDuck(0,-1);
            } else if (keysDown[KeyEvent.DOM_VK_LEFT] === true) {
                sendMessage("/west");
                moveMyDuck(-1,0);
            } else if (keysDown[KeyEvent.DOM_VK_RIGHT] === true) {
                sendMessage("/east");
                moveMyDuck(1,0);
            }
        }
    }, 1000/60); //input framerate is super high

    /**
     * Send message when user presses Enter key
     */
    input.onkeydown = function(e) {
        switch (e.keyCode) {
            case KeyEvent.DOM_VK_ENTER:
            case KeyEvent.DOM_VK_RETURN:
            var msg = this.value;
            sendMessage(msg);
            this.value = '';
            break;
        }
    };
 
/*   setInterval(function() {
        if (connection.readyState !== 1) {
            status.innerHTML = 'Error';
            input.disabled = true;
            input.value = ('Unable to communicate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);*/
 
    /**
     * Add message to the chat window
     */
    function addMessage(author, message, color, dt) {
        var newMessage = document.createElement('div');
        newMessage.innerHTML = '<span style="background-color:' + color + '">' + author + '</span>'
        //     + " @" 
        //     + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
        //     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message;
        content.insertBefore(newMessage, null);
        content.scrollTop = content.scrollHeight; //scroll to bottom of div
    }

    function addMessages(messages) {
        for (var i=0; i < messages.length; i++) {
                addMessage(messages[i].author, messages[i].text,
                           messages[i].color, new Date(messages[i].time));
            }
    }
};

window.onLoad = frontend();