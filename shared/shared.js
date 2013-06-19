
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
		gridData[ 1] = "q75555555555";
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

		var noteTiles = ['?'];

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
        user.pos.x += x;
        user.pos.y += y;

        var map = this.getMap(user.map);
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
        	user.diveMoves = 0;
        	return true;
        }

        //cancel dive if we try to leave the water - or if we've run out of air
        if (user.diveMoves > 0) {
        	if (map.isWater(user.pos) === false || user.diveMoves === 1) {
        		user.diveMoves = 0;
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