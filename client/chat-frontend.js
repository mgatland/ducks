var frontend = function () {
    "use strict";

    var debug = true;
 
    //get element by id
    function get (element) {
        return document.getElementById(element);
    }

    //data from the server
    var users;
    var keysDown = [];

    var socket = undefined;
    var port = "80";

    //stuff    
    var tileSize = 48;
    var scale = 3; //16x16 tiles are scaled up 3 times
    var screenWidth = 12;
    var screenHeight = 12;
    var duckTileSizeX = 16*scale;
    var duckTileSizeY = 18*scale;
    var duckYOffset = tileSize - duckTileSizeY;
    console.log(duckYOffset);

    var itemsLoaded = 0;
    var itemsToLoad = 1; //the '1' locks until all items have been requested

    var replaceHex = "#fff8bc"; //color to replace with user color
    var duckImage = loadImage("/client/duck.png");
    var srcTilesImg = loadImage("/client/tiles.png");
    var spritesForColor = {}; //map of color name to sprites for that color duck

    //unlock the loader
    itemHasLoaded("asset list");

    var hasSentName = false;
    var moved = false;
    var moveDelay = 1000/4;

    function itemHasLoaded(name) {
        console.log("loaded " + name);
        itemsLoaded++;
        if (itemsLoaded === itemsToLoad) {
            allItemsHaveLoaded();
        }
    }

    function connect() {
        console.log("connecting to port " + port);
        socket = io.connect("http://" + document.domain + ":" + port); //document.domain or "ducks.hp.af.cm" 

        socket.on('connect', function () {
            // first we want users to enter their names
            status.innerHTML = 'NAME:';
        });
     
       /* connection.onerror = function (error) {
            // just in there were some problems with connection...
            content.innerHTML = '<p>Sorry, but there\'s some problem with your '
                                        + 'connection or the server is down.</p>'; 
        };*/

        socket.on('updatechat', function (data) {
            if (data.type === 'state') { // world update
                console.log('recieved list of players');
                users = data.data.users;
                drawEverything();
            } else if (data.type === 'loggedin') {
                myName = data.data.name;
                status.innerHTML = myName + ':';
                status.style.color = data.data.color;
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


    }

    function allItemsHaveLoaded() {
        console.log("all " + itemsToLoad + " items have loaded");
        initializeSprites(duckImage);
        createTileSet();
        connect();
    }

    var tilesImg;
    function createTileSet() {
        var tilesCanvas = document.createElement("canvas");
        drawScaledUpImageOnCanvas(tilesCanvas, srcTilesImg, scale);
        var tileImgUrl = tilesCanvas.toDataURL();
        tilesImg = loadGeneratedImage(tileImgUrl, null);
    }

    var duckTemplateImgData;

    function initializeSprites(srcImage) {
        var spriteCanvas = document.createElement("canvas");
        drawScaledUpImageOnCanvas(spriteCanvas, srcImage, scale);
        var s_ctx = spriteCanvas.getContext("2d");
        duckTemplateImgData = s_ctx.getImageData(0, 0, spriteCanvas.width, spriteCanvas.height);
    }

    function drawScaledUpImageOnCanvas(canvas, srcImage, scale) {
        canvas.width = srcImage.width*scale;
        canvas.height = srcImage.height*scale;  
        var s_ctx = canvas.getContext("2d");

        //disable smoothing
        s_ctx.imageSmoothingEnabled = false;
        s_ctx.webkitImageSmoothingEnabled = false;
        s_ctx.mozImageSmoothingEnabled = false;

        s_ctx.scale(scale, scale);
        s_ctx.drawImage(srcImage, 0, 0);

        if (debug) {
            get("panel").insertBefore(canvas, null);
        }
    }

    function getSprites(color) {
        var existingSprites = spritesForColor[color];
        if (existingSprites !== undefined) {
            return existingSprites;
        }
        console.log("generating new " + color + " sprites.");

        var spriteCanvas = document.createElement("canvas");
        spriteCanvas.width = duckTemplateImgData.width;
        spriteCanvas.height = duckTemplateImgData.height;
        var s_ctx = spriteCanvas.getContext("2d");
        var spriteImgData = s_ctx.getImageData(0, 0, duckTemplateImgData.width, duckTemplateImgData.height);
        for (var rgbI = 0; rgbI < spriteImgData.data.length; rgbI++) {
            spriteImgData.data[rgbI] = duckTemplateImgData.data[rgbI];
        }

        var newColor = hexToRgb(color);

        var r, g, b, i;
        for (var rgbI = 0; rgbI < spriteImgData.data.length; rgbI+=4) {
            i = duckTemplateImgData.data[rgbI+3];
            if (i !== 0) {
                r = duckTemplateImgData.data[rgbI+0];
                g = duckTemplateImgData.data[rgbI+1];
                b = duckTemplateImgData.data[rgbI+2];

                var hex = rgbToHex(r,g,b);
                if (hex == replaceHex) {
                    r = newColor.r;
                    g = newColor.g;
                    b = newColor.b;
                }
                spriteImgData.data[rgbI+0] = r;
                spriteImgData.data[rgbI+1] = g;
                spriteImgData.data[rgbI+2] = b;
                spriteImgData.data[rgbI+3] = i;
            }
        }

        s_ctx.putImageData(spriteImgData, 0, 0);

        if (debug) {
            get("panel").insertBefore(spriteCanvas, null);
        }

        var spriteUrl = spriteCanvas.toDataURL();
        var sprites = loadGeneratedImage(spriteUrl, drawEverything);
        spritesForColor[color] = sprites;
        return sprites;
    }

    /////// color utils
    //thanks http://stackoverflow.com/a/5624139/439948
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    ///////

    function loadImage(name)
    {
        itemsToLoad++;
        var image = new Image();
        image.onload = function () {
            itemHasLoaded(name);
        }
        image.src = name;
        return image;
    }

    function loadGeneratedImage(name, onload) {
        var image = new Image();
        image.onload = onload;
        image.src = name;
        return image;
    }

    // for better performance - to avoid searching in DOM
    var content = get('chat');
    var input = get('input');
    var status = get('status');
 
    var canvas = get('gamescreen');
    var ctx = canvas.getContext("2d");
    canvas.width = screenWidth*tileSize;
    canvas.height = screenWidth*tileSize;

    //from server
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

    function getCurrentMap() {
        var myDuck = getMyDuck();
        var map = myDuck.map || new shared.Pos(0,0);
        return map;
    }

    function forEachCell(mapData, func) {
        var pos = new shared.Pos(0,0); //the coordinates here don't matter.
        for (var i = 0; i < mapData.getWidth(); i ++) {
            for (var j = 0; j < mapData.getHeight(); j++) {
                pos.x = i;
                pos.y = j;
                func(mapData.get(pos), pos);
            }
        }
    }

    function drawEverything () {
        //draw the tiles
        var map = getCurrentMap();
        var mapData = shared.getMap(map);
        //ctx.fillStyle = '#72D';
        forEachCell(mapData, function (tile, pos) {
            if (tile === 'x') {
                ctx.drawImage(tilesImg, 0, 0, tileSize, tileSize, pos.x*tileSize,pos.y*tileSize,tileSize,tileSize);
            } else {
                ctx.drawImage(tilesImg, 1*tileSize, 0, tileSize, tileSize, pos.x*tileSize,pos.y*tileSize,tileSize,tileSize);
            }
        });

        users.forEach(function(user) {
            if (user.name != false && shared.posAreEqual(user.map, map)) {
                ctx.fillStyle = user.color;
                var sprites = getSprites(user.color);
                if (user.act === 'quack') {
                    ctx.drawImage(sprites, 1*duckTileSizeX, 0, duckTileSizeX, duckTileSizeY, user.pos.x * tileSize, user.pos.y * tileSize + duckYOffset, duckTileSizeX, duckTileSizeY);
                } else if (user.act === 'nap') {
                    ctx.drawImage(sprites, 3*duckTileSizeX, 0, duckTileSizeX, duckTileSizeY, user.pos.x * tileSize, user.pos.y * tileSize + duckYOffset, duckTileSizeX, duckTileSizeY);
                } else {
                    ctx.drawImage(sprites, 0, 0, duckTileSizeX, duckTileSizeY, user.pos.x * tileSize, user.pos.y * tileSize + duckYOffset, duckTileSizeX, duckTileSizeY);
                }
            }
        });
    }

    function sendMessage(msg) {
        if (!msg) {
            return;
        }
        var type = null;
        var message = {};
        if (hasSentName === false && msg.charAt(0) != '/') {
            type = "adduser";
            message = msg;
            hasSentName = true;
            console.log("Sending name to server");
            status.innerHTML = 'WAIT:';
        } else if (msg.charAt(0) === '/') {
            type = 'cmd';
            message = msg.substring(1);
        } else {
            type = 'sendchat';
            message = msg;
        }
        socket.emit(type, message);
    }

    function getMyDuck() {
        var myIndex = shared.getIndexOfUser(myName, users);
        var myDuck = users[myIndex];
        return myDuck;
    }

    function moveMyDuck(x, y) {
        var myDuck = getMyDuck();
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
        var style = makeChatStyle(color);
        newMessage.innerHTML = '<span class="chatname" style="' + style + '">' + author + '</span>'
        //     + " @" 
        //     + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
        //     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message;
        content.insertBefore(newMessage, null);
        content.scrollTop = content.scrollHeight; //scroll to bottom of div
    }

    function makeChatStyle(color) {
        //todo: we should get this list of colors from the server, or calculate
        //which colors are light or dark using math.
        var fore = '';
        if (color === '#fff8bc' 
            || color === '#8effc1'
            || color === '#dda0dd'
            || color === '#ffa500'
            || color === '#8effc1'
            || color === '#ff00ff') {
            fore = '; color: black';
        }
        var back = 'background-color: ' + color;
        return back + fore;
    }

    function addMessages(messages) {
        for (var i=0; i < messages.length; i++) {
                addMessage(messages[i].author, messages[i].text,
                           messages[i].color, new Date(messages[i].time));
            }
    }
};

window.onLoad = frontend();