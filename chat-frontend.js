var frontend = function () {
    "use strict";
 
    //get element by id
    function g (element) {
        return document.getElementById(element);
    }


    //data from the server
    var users;
    var myIndex;



    //stuff    
    var tileSize = 48;
    var duckImage = loadImage("duck.png");

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
    var content = g('content');
    var input = g('input');
    var status = g('status');
 
    var canvas = g('gamescreen');
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = '#A0F';
    ctx.fillRect(0,0,500,500);

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

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
 
    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.innerHTML = '<p>Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.</p>';
        input.hide();
        status.hide();
        return;
    }
 
    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1337');

    function drawUsers () {
        //clear background
        ctx.fillStyle = '#A0F';
        ctx.fillRect(0,0,500,500);

        users.forEach(function(user) {
            ctx.fillStyle = user.color;
            ctx.fillRect(user.pos.x * tileSize-4, user.pos.y * tileSize-4, tileSize+8, tileSize+8);
            ctx.drawImage(duckImage, user.pos.x * tileSize, user.pos.y * tileSize);
        });
    }

    connection.onopen = function () {
        // first we want users to enter their names
        input.disabled = false;
        status.innerHTML = 'Choose name:';
    };
 
    connection.onerror = function (error) {
        // just in there were some problems with connection...
        content.innerHTML = '<p>Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.</p>'; 
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
 
        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.innerHTML = myName + ': ';
            status.style.color = myColor;
            input.disabled = false;
            input.focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            addMessages(json.data);
        } else if (json.type === 'state') { // world update
            addMessages(json.data.messages);
            users = json.data.users;
            myIndex = json.data.yourIndex;

            drawUsers();

        } else if (json.type === 'message') { // it's a single message
            input.disabled = false; // let the user write another message
            addMessage(json.data.author, json.data.pos, json.data.text,
                       json.data.color, new Date(json.data.time));
        } else if (json.type === 'ack') { // it's a single message
            input.disabled = false; // let the user write another message
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };
 
    function sendMessage(msg) {
        if (!msg) {
            return;
        }
        var message = {};
        if (msg.charAt(0) === '/') {
            message.type = 'cmd';
            message.msg = msg.substring(1);
        } else {
            message.type = 'chat';
            message.msg = msg;
        }
        var json = JSON.stringify(message);
        connection.send(json);
    }

    function moveMyDuck(x, y) {
        var myDuck = users[myIndex];
        myDuck.pos.x += x;
        myDuck.pos.y += y;
        drawUsers();
    }

    /**
     * Send message when user presses Enter key
     */
    input.onkeydown = function(e) {
        switch (e.keyCode) {

            case KeyEvent.DOM_VK_DOWN:
                sendMessage("/south");
                moveMyDuck(0,1);
            break;
            case KeyEvent.DOM_VK_UP:
                sendMessage("/north");
                moveMyDuck(0,-1);
            break;
            case KeyEvent.DOM_VK_LEFT:
                sendMessage("/west");
                moveMyDuck(-1,0);
            break;
            case KeyEvent.DOM_VK_RIGHT:
                sendMessage("/east");
                moveMyDuck(1,0);
            break;

            case KeyEvent.DOM_VK_ENTER:
            case KeyEvent.DOM_VK_RETURN:
            var msg = this.value;
            sendMessage(msg);
            this.value = '';
            // disable the input field to make the user wait until server
            // sends back response
            input.disabled = true;
 
            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
            break;
        }
    };
 
    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.innerHTML = 'Error';
            input.disabled = true;
            input.value = ('Unable to communicate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);
 
    /**
     * Add message to the chat window
     */
    function addMessage(author, pos, message, color, dt) {
        var newMessage = document.createElement('p');
        newMessage.innerHTML = '<span style="color:' + color + '">' + author + '</span> '
             + "(" + pos.x + ", " + pos.y + ") @" 
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message;
        content.insertBefore(newMessage, content.firstChild);
    }

    function addMessages(messages) {
        for (var i=0; i < messages.length; i++) {
                addMessage(messages[i].author, messages[i].pos, messages[i].text,
                           messages[i].color, new Date(messages[i].time));
            }
    }
};

frontend();