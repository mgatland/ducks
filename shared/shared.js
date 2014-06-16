
(function(exports){

	exports.Pos = function(x, y) {
	    this.x = x;
	    this.y = y;
	    this.toString = function() {
	        return "(" + this.x + "," + this.y + ")";
	    }
	}

	exports.startingPos = function() {
		return new exports.Pos(10,10);
	}

	exports.posAreEqual = function(p1, p2) {
		return (p1.x === p2.x && p1.y === p2.y); 
	}

   exports.getIndexOfUser = function (name, users) {
        var index = null;
        users.forEach(function(user, idx) {
            if (user.name === name) {
                index = idx;
            }
        });
        return index;
    }

    //treasure room
    var map_09_10 = function () {
		var gridData = [];
		gridData[ 0] = "xxxxxxxxxxxx";
		gridData[ 1] = "x          x";
		gridData[ 2] = "x       ?  x";
		gridData[ 3] = "x  z       x";
		gridData[ 4] = "xxxxx  xxxxx";
		gridData[ 5] = "x           ";
		gridData[ 6] = "x         , ";
		gridData[ 7] = "xxxxx .xxxxx";
		gridData[ 8] = "x    .     x";
		gridData[ 9] = "x .     ., x";
		gridData[10] = "x .  ,     x";
		gridData[11] = "xxxxx//xxxxx";
		return gridData;
    }

    //home room
    var map_10_10 = function () {
		var gridData = [];
		gridData[ 0] = "xxxxxxxxxxxx";
		gridData[ 1] = "x          x";
		gridData[ 2] = "x          x";
		gridData[ 3] = "x          x";
		gridData[ 4] = "x          x";
		gridData[ 5] = "            ";
		gridData[ 6] = "            ";
		gridData[ 7] = "x          x";
		gridData[ 8] = "x          x";
		gridData[ 9] = "x ,        x";
		gridData[10] = "x          x";
		gridData[11] = "xxxxxxxxxxxx";
		return gridData;
    }

    //pillar room
    var map_11_10 = function () {
		var gridData = [];
		gridData[ 0] = "xxxxvxccvcxx";
		gridData[ 1] = "x  vc    xcx";
		gridData[ 2] = "x      v   x";
		gridData[ 3] = "x        ? c";
		gridData[ 4] = "x   c      v";
		gridData[ 5] = "           x";
		gridData[ 6] = "           c";
		gridData[ 7] = "x          c";
		gridData[ 8] = "x  m   m   v";
		gridData[ 9] = "x  n   n   x";
		gridData[10] = "xb        bc";
		gridData[11] = "xxxx///xxxcc";
		return gridData;
    }

    //desert pond (below treasure room)
    var map_09_11 = function () {
		var gridData = [];
		gridData[ 0] = "qq8875598888";
		gridData[ 1] = "q75555555*55";
		gridData[ 2] = "455555555555";
		gridData[ 3] = "455QWWWWWE55";
		gridData[ 4] = "455ASSSSSD55";
		gridData[ 5] = "455ASSSSSD55";
		gridData[ 6] = "455ASSSSSD55";
		gridData[ 7] = "455ASSSSSD55";
		gridData[ 8] = "455ASSSSSD55";
		gridData[ 9] = "455ASSSSSD55";
		gridData[10] = "q15ZXXXXXC55";
		gridData[11] = "qq2222222222";
		return gridData;
    }

    //desert trees (below home screen)
    var map_10_11 = function () {
		var gridData = [];
		gridData[ 0] = "888888888888";
		gridData[ 1] = "555555555555";
		gridData[ 2] = "555w5555w555";
		gridData[ 3] = "555555555555";
		gridData[ 4] = "555555555555";
		gridData[ 5] = "555555555555";
		gridData[ 6] = "555555555555";
		gridData[ 7] = "555w5555w555";
		gridData[ 8] = "555555555555";
		gridData[ 9] = "555555555555";
		gridData[10] = "555555555555";
		gridData[11] = "222222222222";
		return gridData;
    }

    //desert tunnel, below pillar room
    var map_11_11 = function () {
		var gridData = [];
		gridData[ 0] = "8887555988qq";
		gridData[ 1] = "55555555559q";
		gridData[ 2] = "555555555559";
		gridData[ 3] = "555555555553";
		gridData[ 4] = "55555555322q";
		gridData[ 5] = "555555556qqq";
		gridData[ 6] = "555555556qqq";
		gridData[ 7] = "555555556qqq";
		gridData[ 8] = "55555553qqqq";
		gridData[ 9] = "5553222qqqqq";
		gridData[10] = "553qqqqqqqqq";
		gridData[11] = "22qqqqqqqqqq";
		return gridData;
    }

    //secret room
    var map_09_12 = function () {
		var gridData = [];
		gridData[ 0] = "qq88888888qq";
		gridData[ 1] = "q75QWWWWWE9q";
		gridData[ 2] = "455ASSSSSD56";
		gridData[ 3] = "455ASSSSSD56";
		gridData[ 4] = "455ASSSXXC56";
		gridData[ 5] = "455ASSD55556";
		gridData[ 6] = "455ASSD5w556";
		gridData[ 7] = "455ZXXC55556";
		gridData[ 8] = "455555555556";
		gridData[ 9] = "4555w555w556";
		gridData[10] = "q1555555553q";
		gridData[11] = "qq22222222qq";
		return gridData;
    }

	var createGrid = function (gridData) {

		var levelWidth = gridData[0].length;
		var levelHeight = gridData.length;

		var grid = {};

		grid.isInMap = function (pos) {
			if (pos.x < 0 || pos.x >= levelWidth) {
				return false;
			}
			if (pos.y < 0 || pos.y >= levelHeight) {
				return false;	
			}
			return true;
		}

		grid.get = function (pos) {
			if (!this.isInMap(pos)) {
				return "x";
			}
			return gridData[pos.y][pos.x]; 
		};


		var wallTiles = ['z', 'x', 'c', 'v', 'b', 'n', 'm',
						'7', '8', '9', '4', '6', '1', '2', '3',
						'q', 'w' ];

		var waterTiles = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];

		var noteTiles = ['?', '*'];

		grid.isWalkable = function (pos) {
			var tile = this.get(pos);
			if (wallTiles.indexOf(tile) !== -1) return false;
			return true;
		}

		grid.isWater = function (pos) {
			var tile = this.get(pos);
			if (waterTiles.indexOf(tile) !== -1) return true;
			return false;
		}

		grid.isNote = function (pos) {
			var tile = this.get(pos);
			if (noteTiles.indexOf(tile) !== -1) return true;
			return false;
		}

		//any square with water above or below it is an underwater tunnel
		grid.isUnderwaterTunnel = function (pos) {
			if (this.isWalkable(pos) === false) { //it's a wall
				var above = new exports.Pos(pos.x, pos.y - 1);
				if (this.isWater(above)) {
					return true;
				}
				var below = new exports.Pos(pos.x, pos.y + 1);
				if (this.isWater(below)) {
					return true;
				}
			}
			return false;
		}

		grid.getWidth = function () {
			return levelWidth;
		}

		grid.getHeight = function () {
			return levelHeight;
		}

		return grid;
	}    

    var maps = []; //x[], then y[]
    maps[9] = [];
    maps[10] = [];
    maps[11] = [];

    maps[9][10] = createGrid(map_09_10());
    maps[10][10] = createGrid(map_10_10());
    maps[11][10] = createGrid(map_11_10());

    maps[9][11] = createGrid(map_09_11());
    maps[10][11] = createGrid(map_10_11());
    maps[11][11] = createGrid(map_11_11());

    maps[9][12] = createGrid(map_09_12());

    exports.getMap = function (pos) {
    	return maps[pos.x][pos.y];
    }

    exports.isUserOnNote = function (user) {
    	var map = this.getMap(user.map);
    	if (map.isNote(user.pos) === true) {
    		return true;
    	}
    	return false;
    }

    exports.isSwimming = function (user) {
    	var map = this.getMap(user.map);
    	if (map.isWater(user.pos) === true) {
    		return true;
    	}
    	return false;
    }

    undoMove = function (user, x, y) {
    	user.pos.x -= x;
    	user.pos.y -= y;
    }

    exports.move = function (user, x, y) {
    	var map = this.getMap(user.map);
    	var wasInUnderwaterTunnel = map.isUnderwaterTunnel(user.pos);

    	if (user.act === 'nap') {
    		user.act = false;
    		return true; //wake up, but don't move.
    	}

        user.pos.x += x;
        user.pos.y += y;

        
        //map transitions
        if (map.isInMap(user.pos) === false) {
        	if (user.pos.x === -1) {
        		user.map.x--;
        		user.pos.x = this.getMap(user.map).getWidth() - 1;
        	} else if (user.pos.x === map.getWidth()) {
        		user.map.x++;
        		user.pos.x = 0;
        	} else if (user.pos.y === -1) {
        		user.map.y--;
        		user.pos.y += this.getMap(user.map).getHeight();
        	} else if (user.pos.y === map.getHeight()) {
        		user.map.y++;
        		user.pos.y = 0;
        	} else {
        		console.log("Cancelling weird error off-screen move: " + user.name + " " + user.pos);
	            undoMove(user, x, y);
	            return false;
        	}
        	return true;
        }
        
        if (user.diveMoves > 0) {
        	
        	var isTunnel = map.isUnderwaterTunnel(user.pos);

        	if (isTunnel === true && user.diveMoves > 1 && wasInUnderwaterTunnel === false) {
        		//we entered an underwater tunnel.
        		user.diveMoves--;
        		return true;
        	}

        	if (isTunnel === true && wasInUnderwaterTunnel === true) {
        		//we're moving around in a tunnel - we don't run out of breath
        		user.diveMoves--;
        		if (user.diveMoves < 1) {
        			user.diveMoves = 1;
        		}
        		return true;
        	}

        	if (isTunnel === false && wasInUnderwaterTunnel === true) {
        		//we're leaving a tunnel - let us leave, even though we only have 1 breath
        		if (map.isWater(user.pos) === true) {
        			return; //leaving us with 1 breath.
        		}
        	}

        	//cancel dive if we try to leave the water - or if we've run out of air	
        	if (map.isWater(user.pos) === false || user.diveMoves === 1) {
        		if (wasInUnderwaterTunnel === false) {
        			user.diveMoves = 0;	 //unless we're under ground and can't come up
        		}
        		undoMove(user, x, y);
        		return true; //we didn't move, but we did undive
        	}

        }

        //normal movement
        if (map.isWalkable(user.pos) === false) {
            undoMove(user, x, y);
            return false;
        }

        //diving
        if (user.diveMoves > 0) {
        	user.diveMoves--;
        }

        return true;
    }

})(typeof exports === 'undefined'? this['shared']={}: exports);