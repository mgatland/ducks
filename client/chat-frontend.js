var debugLag = 0;
var smartUpdates = true;

var editorTile = 0;

var loader = function () {

    //iOS Safari 7.1 has a bug, in full screen mode it lets you
    //scroll past the end of the page. Rotating can trigger it.
    //this workaround scrolls you back to the top.
    var scrollToTop = function () {
        if (window.pageYOffset > 0) {
            window.scrollTo(0, 0);
        }
    }
    window.addEventListener('orientationchange', scrollToTop);
    window.addEventListener('scroll', scrollToTop);

    var itemsLoaded = 0;
    var itemsToLoad = 0;
    this.duckImage = loadImage("/client/duck.png");
    this.srcTilesImg = loadImage("/client/tiles.png");

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

    function itemHasLoaded(name) {
        console.log("loaded " + name);
        itemsLoaded++;
        if (itemsLoaded === itemsToLoad) {
            allItemsHaveLoaded();
        }
    }

    function allItemsHaveLoaded() {
        console.log("all " + itemsToLoad + " items have loaded");
        frontend(this);
    }
}

var frontend = function (assets) {
    "use strict";

    var debug = false;
 
    function get (element) {
        return document.querySelector("." + element);
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

    var replaceHex = "#fff8bc"; //color to replace with user color
    var spritesForColor = {}; //map of color name to sprites for that color duck

    var hasSentName = false;
    var moved = false;
    var moveDelay = 1000/4;

    function connect() {
        console.log("connecting to port " + port);
        socket = io.connect("http://" + document.domain + ":" + port);

        socket.on('connect', function () {
            // first we want users to enter their names
            status.innerHTML = 'YOUR DUCK NAME:';
        });
     
       /* connection.onerror = function (error) {
            // just in there were some problems with connection...
            content.innerHTML = '<p>Sorry, but there\'s some problem with your '
                                        + 'connection or the server is down.</p>'; 
        };*/

        function onData (data) {
            if (data.type === 'state') { // world update
                console.log('recieved list of players');
                users = data.data.users;
                drawEverything();
            } else if (data.type === 'loggedin') {
                myName = data.data.name;
                status.innerHTML = myName + ':';
                status.style.color = data.data.color;
                get("ingame").classList.remove("hide");
            } else if (data.type === 'messages') {
                addMessages(data.data.messages);
            } else if (data.type === 'servermessage') {
                //input.disabled = false;
                addServerMessage(data.data.text);
            } else if (data.type === 'npc') {
                showNPCMessage(data.data.text);
            } else if (data.type === 'playerUpdate') {
                var updatedUser = data.data;
                //find the user to update in our array
                var index = shared.getIndexOfUser(updatedUser.name, users);
                if (index != null) {
                    if (updatedUser.name === myName) {
                        updateMyself(updatedUser, index);
                    } else {
                        users[index] = updatedUser;    
                    }
                } else {
                    console.log("update for new user: " + updatedUser.name);
                    users.push(updatedUser);
                }
                drawEverything();
            } else if (data.type === 'playerleaves') {
                var index = shared.getIndexOfUser(data.data, users);
                if (index !== null) {
                    users.splice(index, 1);
                    drawEverything();
                }

            } else {
                console.log('Hmm..., I\'ve never seen data like this: ', data);
            }
        }

        socket.on('updatechat', function (data) {
           if (debugLag > 0) {
            setTimeout(function () {
                onData(data);
            }, Math.random()*debugLag);
           } else {
            onData(data);
           }
        });
    }

    function start() {
        initializeSprites(assets.duckImage);
        createTileSet();
        connect();
    }

    var tilesImg;
    function createTileSet() {
        var tilesCanvas = document.createElement("canvas");
        drawScaledUpImageOnCanvas(tilesCanvas, assets.srcTilesImg, scale);
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
           get("notes").insertBefore(canvas, null);
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
            get("notes").insertBefore(spriteCanvas, null);
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

    function loadGeneratedImage(name, onload) {
        var image = new Image();
        image.onload = onload;
        image.src = name;
        return image;
    }

    var content = get('chat');
    var input = get('input');
    var status = get('status');
 
    var canvas = get('gamescreen');
    var ctx = canvas.getContext("2d");
    canvas.width = screenWidth*tileSize;
    canvas.height = screenWidth*tileSize;

    var expectedUpdates = [];

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

    function updateMyself(data, index) {
        if (expectedUpdates.length > 0) {
            var expected = expectedUpdates.shift();
            if (_.isEqual(data, expected)) {
                //console.log("(ignore expected update from server)");
                return;
            } else {
                console.log("Unexpected update from server.")
                //No point keeping our future predictions then.
                expectedUpdates.length = 0;
            }
        }
        users[index] = data;
    }

    function getCurrentMap() {
        var myDuck = getMyDuck();
        if (myDuck && myDuck.map) {
            return myDuck.map;
        }
        return shared.titleMap();
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

    function drawTile(ctx, pos, num) {
        var tX = num % 10;
        var tY = Math.floor(num / 10); 
        ctx.drawImage(tilesImg, tX*tileSize, tY*tileSize, tileSize, tileSize, pos.x*tileSize,pos.y*tileSize,tileSize,tileSize);
    }

    function drawEverything () {

        //hack to make the canvas redraw. Sometimes, like 10% of the time, the canvas
        //won't display anything. Doing this (just once) fixes it.
        var canvasHack = get('gamescreen');
        canvasHack.height = canvasHack.height + 1;
        canvasHack.height = canvasHack.height - 1;

        //draw the tiles
        var map = getCurrentMap();
        var mapData = shared.getMap(map);
        forEachCell(mapData, function (tile, pos) {
            if (tile === 0 && showChestSecret()) {
                drawTile(ctx, pos, 8);
            } else {
                drawTile(ctx, pos, tile);
            }
        });

        users.forEach(function(user) {
            if (user.name != false && shared.posAreEqual(user.map, map)) {
                ctx.fillStyle = user.color;
                var sprites = getSprites(user.color);
                var swimming = shared.isSwimming(user);
                var frame;
                if (user.diveMoves > 0) {
                    frame = 2;
                } else if (user.act === 'quack') {
                    frame = 1;
                } else if (user.act === 'nap') {
                    frame = 3;
                } else {
                    frame = 0;
                }
                var redEyes = (user.item === "curse" && (frame === 0 || frame === 1));
                drawDuck(ctx, sprites, user.pos, frame, swimming, redEyes);
            }
        });

        if (nightmareTimer > 0) {
            for (var i = 0; i < nightmareTimer/2; i++) {
                var pos = new shared.Pos(
                    Math.floor(Math.random()*12),
                    Math.floor(Math.random()*12));
                if (chestRedPositions[pos.y] 
                    && chestRedPositions[pos.y].indexOf(pos.x) !== -1
                    && nightmareTimer > Math.random() * chestNightmareDuration * 0.8) {
                    var tile = 9;
                } else {
                    var tile = Math.floor(Math.random()*9);
                }
                drawTile(ctx, pos, tile);
            }
        }
    }

    //hack takes color from inside duck's mouth to draw red pixels
    function drawRedPixelHack(ctx, sprites, pos, yOffset, x, y) {
        ctx.drawImage(sprites, 1*duckTileSizeX+5, 12, 3, 3, pos.x * tileSize + x*3, pos.y * tileSize + yOffset + y*3, 3, 3);
    }

    function drawDuck(ctx, sprites, pos, tX, swimming, redEyes) {
        var yHeight = duckTileSizeY;
        var yOffset = duckYOffset;
        if (swimming === true) {
            yHeight = 36;
            yOffset += 6;
        }
        ctx.drawImage(sprites, tX*duckTileSizeX, 0, duckTileSizeX, yHeight, pos.x * tileSize, pos.y * tileSize + yOffset, duckTileSizeX, yHeight);
        
        if (redEyes) {
            //hacks to draw red eyes on the duck.
            drawRedPixelHack(ctx, sprites, pos, yOffset, 3, 2);
            drawRedPixelHack(ctx, sprites, pos, yOffset, 5, 2);
            drawRedPixelHack(ctx, sprites, pos, yOffset, 3, 3);
            drawRedPixelHack(ctx, sprites, pos, yOffset, 5, 3);
        }
    }

    function sendMessage(msg) {
        msg = msg.trim();
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

        if (debugLag > 0) {
            setTimeout(function () {
                socket.emit(type, message);
            }, Math.random() * debugLag);
        } else {
            socket.emit(type, message);
        }
    }

    function getMyDuck() {
        var myIndex = shared.getIndexOfUser(myName, users);
        var myDuck = users[myIndex];
        return myDuck;
    }

    function moveMyDuck(x, y) {
        var myDuck = getMyDuck();
        if (myDuck) {
            shared.move(myDuck, x, y);
            moved = true;
            setTimeout(function(){
                moved = false;
            }, moveDelay);
            drawEverything();
        }
    }

    function expectServerUpdate() {
        if (smartUpdates) {
            var myDuckClone = _.cloneDeep(getMyDuck());
            expectedUpdates.push(myDuckClone);
        }
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


    var npcMessage = "";
    var npcMessageProgress = 0;
    var npcTimer = 0;

    function updateNPCMessage() {
        if (npcMessage.length > npcMessageProgress) {
            npcTimer++;
            if (npcTimer > 4) {
                npcTimer = 0;
                var letter = npcMessage[npcMessageProgress];
                if (letter === "\n") letter = "<br>";
                get("npc-message").innerHTML += letter;
                npcMessageProgress++;
            }
        }
    }

    var chestSecretTimer = 0;
    var chestShowSecretAfter = 60*10; //const
    var chestShowNightmareAfter = 60*14; //const
    var chestNightmareDuration = 60*10; //const
    var chestMap = new shared.Pos(9,10);
    var chestPos = new shared.Pos(3, 3);
    var nightmareTimer = 0;
    var chestRedPositions = []; //y,x
    chestRedPositions[3] = [2,3,4,7,8,9];
    //chestRedPositions[8] = [3,4,5,6,7,8];

    function updateSecrets() {
        var forceRedraw = false;
        if (!users) return;
        var myDuck = getMyDuck();
        var everyoneAsleep = true;
        var anyoneAsleep = false;
        users.forEach(function(user) {
            if (user.name != false && shared.posAreEqual(user.map, chestMap)) {
                if (user.act === 'nap') {
                    anyoneAsleep = true;
                } else {
                    everyoneAsleep = false;
                }
            }
        });
        if (everyoneAsleep === true && anyoneAsleep === true) {
            chestSecretTimer++;
            if (chestSecretTimer === chestShowSecretAfter) {
                forceRedraw = true;
            }
            if (chestSecretTimer > chestShowNightmareAfter
                && shared.distanceBetweenPos(chestPos, myDuck.pos) === 1) {
                forceRedraw = true; //must draw nightmare every frame
                nightmareTimer++;
                if (nightmareTimer === chestNightmareDuration) {
                    sendMessage("/wilberforce");
                }
            } else {
                if (nightmareTimer > 0) {
                    forceRedraw = true;
                    nightmareTimer = 0;
                }
            }
        } else {
            if (chestSecretTimer > 0 || nightmareTimer > 0) {
                forceRedraw = true;
                chestSecretTimer = 0;
                nightmareTimer = 0;
            }
        }
        if (forceRedraw) {
            drawEverything();
        }
    }

    function showChestSecret() {
        return (chestSecretTimer >= chestShowSecretAfter);
    }

    //move if I'm ready to move and holding a direction button
    function tryMoving() {
        var didSomething = false;
        if (moved === false) {
            if (keysDown[KeyEvent.DOM_VK_DOWN] === true) {
                sendMessage("/south");
                moveMyDuck(0,1);
                expectServerUpdate();
                didSomething = true;
            } else if (keysDown[KeyEvent.DOM_VK_UP] === true) {
                sendMessage("/north");
                moveMyDuck(0,-1);
                expectServerUpdate();
                didSomething = true;
            } else if (keysDown[KeyEvent.DOM_VK_LEFT] === true) {
                sendMessage("/west");
                moveMyDuck(-1,0);
                expectServerUpdate();
                didSomething = true;
            } else if (keysDown[KeyEvent.DOM_VK_RIGHT] === true) {
                sendMessage("/east");
                moveMyDuck(1,0);
                expectServerUpdate();
                didSomething = true;
            }
        }
        if (didSomething) {
            hideNPCMessage();
        }
    }

    setInterval(function() {
        updateSecrets();
        updateNPCMessage();
        tryMoving();
    }, 1000/60); //input framerate is super high

    function doISupportFullScreen() {
        return (document.documentElement.requestFullscreen
            || document.documentElement.msRequestFullscreen
            || document.documentElement.mozRequestFullScreen
            || document.documentElement.webkitRequestFullscreen);
    }
    //From MDN
    function toggleFullScreen() {
      if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    };
    var fullScreenDiv = get("fullscreenbutton");
    if (doISupportFullScreen()) {
        fullScreenDiv.addEventListener('click', toggleFullScreen);
    } else {
        fullScreenDiv.classList.add("hide");
    }


    function cheats (msg) {
        if (msg === "lag on") {
            debugLag = 400;
            addMessage('', 'Fake lag ON', "red");
        }
        if (msg === "lag off") {
            debugLag = 0;
            addMessage('', 'Fake lag OFF', "red");
        }
        if (msg === "smart on") {
            smartUpdates = true;
            addMessage('', 'smart updating ON', "red");
        }
        if (msg === "smart off") {
            smartUpdates = false;
            addMessage('', 'smart updating OFF', "red");
        }
        if (msg === "editor on") {
            get("editor").classList.remove("hide");

            var div = get("editortiles");
            div.addEventListener("click", function (event) {
                var coords = relMouseCoords(div, event);
                coords.x = Math.floor(10 * coords.x / div.width);
                coords.y = Math.floor(20 * coords.y / div.height);
                editorTile = coords.x + 10 * coords.y;
                console.log("Editor tile " + editorTile);
            });
            var gameScreen = get("gamescreen");

            var paint = function (event) {
                var coords = relMouseCoords(gameScreen, event);
                coords.x = Math.floor(12 * coords.x / gameScreen.width);
                coords.y = Math.floor(12 * coords.y / gameScreen.height);
                var map = getCurrentMap();
                var mapData = shared.getMap(map);
                mapData.set(coords, editorTile);
                drawEverything();
                get("editorSave").innerHTML = mapData.raw(); 
            }

            gameScreen.addEventListener("click", paint);
            gameScreen.addEventListener("mousemove", function (e) {
                if (e.shiftKey) paint(e); //hold shift to paint
            });
        }
    }

    var sendChatMessage = function () {
        var msg = input.value;
        sendMessage(msg);
        cheats(msg);
        input.value = '';
        hideNPCMessage(); //on any use action
    }

    /**
     * Send message when user presses Enter key
     */
    input.onkeydown = function(e) {
        switch (e.keyCode) {
            case KeyEvent.DOM_VK_ENTER:
            case KeyEvent.DOM_VK_RETURN:
            sendChatMessage();
            break;
        }
    };

    get("chatButton").addEventListener("click", sendChatMessage);
 
    setupArrowKey("uparrow", KeyEvent.DOM_VK_UP);
    setupArrowKey("downarrow", KeyEvent.DOM_VK_DOWN);
    setupArrowKey("leftarrow", KeyEvent.DOM_VK_LEFT);
    setupArrowKey("rightarrow", KeyEvent.DOM_VK_RIGHT);

    function setupArrowKey(id, keyCode) {

        var setOrUnsetArrowKeyPress = function (arrowDiv, value) {
            keysDown[arrowDiv.keyCode] = value; 
            if (value === true) {
                arrowDiv.className = "arrow pressed";
            } else {
                arrowDiv.className = "arrow";
            }
        }

        var setArrowKeyPress = function (e) {
            if (e.type === "touchstart") {
                e.preventDefault(); //stop mouse events being sent
            }
            setOrUnsetArrowKeyPress(this, true);
            tryMoving();
        }

        var unsetArrowKeyPress = function () {
            setOrUnsetArrowKeyPress(this, false);
        }

        var arrowDiv = get(id);
        arrowDiv.keyCode = keyCode;
        console.log("Binding " + arrowDiv + " to " + keyCode);
        arrowDiv.addEventListener('mousedown', setArrowKeyPress, false);
        arrowDiv.addEventListener('touchstart', setArrowKeyPress, false);

        arrowDiv.addEventListener('mouseout', unsetArrowKeyPress, false);
        arrowDiv.addEventListener('mouseup', unsetArrowKeyPress, false);
        arrowDiv.addEventListener('touchend', unsetArrowKeyPress, false);
        arrowDiv.addEventListener('touchcancel', unsetArrowKeyPress, false);
    }

/*   setInterval(function() {
        if (connection.readyState !== 1) {
            status.innerHTML = 'Error';
            input.disabled = true;
            input.value = ('Unable to communicate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);*/
 
    function addMessage(author, message, color, map) {
        var classes = null;
        if (map) {
            var myDuck = getMyDuck();
            var myMap = myDuck ? myDuck.map : shared.startingPos();
            var distance = shared.distanceBetweenPos(map, myMap);
            if (distance > 0) {
                classes = "distant";
            }
            if (distance > 1) {
                console.log("ERROR: Got far away chat message. Not displaying it.");
                console.log(message);
                return;
            }
        }
        var newMessage = document.createElement('div');
        var style = makeChatStyle(color);
        if (classes) newMessage.classList.add(classes);
        newMessage.innerHTML = '<span class="chatname" style="' + style + '">' + author + ':</span>'
             + ' <span class="chatmessage">' + message + '</span>';
        content.insertBefore(newMessage, null);
        content.scrollTop = content.scrollHeight; //scroll to bottom of div
    }

    function addServerMessage(message) {
        var newMessage = document.createElement('div');
        newMessage.style.color = "#9CC";
        newMessage.innerHTML = message;
        content.insertBefore(newMessage, null);
        content.scrollTop = content.scrollHeight; //scroll to bottom of div 
    }

    function hideNPCMessage() {
        if (npcMessage.length > 0) {
            npcMessage = "";
            get("npc-box").classList.add("hide");
        }
    }

    function showNPCMessage(message) {
        if (message.length > 0) {
            get("npc-box").classList.remove("hide");
            get("npc-message").innerHTML = "";
            npcMessage = message;
            npcMessageProgress = 0;
            npcTimer = 0;
        }
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
                           messages[i].color, messages[i].map);
            }
    }

    start();
};

window.onload = loader;


function relMouseCoords(currentElement, event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
