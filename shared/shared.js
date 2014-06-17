
(function(exports){

	exports.Pos = function(x, y) {
	    this.x = x;
	    this.y = y;
	    this.toString = function() {
	        return "(" + this.x + "," + this.y + ")";
	    }
	}

	exports.titleMap = function() {
		return new exports.Pos(0,0);
	}

	exports.startingPos = function() {
		return new exports.Pos(10,10);
	}

	exports.posAreEqual = function(p1, p2) {
		return (p1.x === p2.x && p1.y === p2.y); 
	}

	exports.distanceBetweenPos = function (p1, p2) {
		return (Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y));
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

    //Lair of Deception!
    var map_10_09 = [1,1,1,1,1,1,1,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,1,10,3,10,2,10,12,10,10,1,1,10,1,10,3,10,2,10,1,1,1,1,1,10,3,10,3,1,2,10,10,10,10,1,1,10,3,10,1,10,1,1,1,1,10,1,1,10,10,10,1,12,12,10,10,10,10,1,1,2,10,1,1,1,1,1,1,1,1,1,1,10,10,3,10,10,10,10,10,10,10,1,1,10,1,1,10,1,1,1,1,1,10,1,1,10,10,10,10,1,10,10,10,10,10,1,1,1,1,1,1,1,10,1,1,1,1,1];
    //treasure room
    var map_09_10 = [1,1,1,1,1,1,1,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,7,10,10,1,1,10,10,0,10,10,10,10,10,10,10,1,1,1,1,1,1,10,10,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,12,10,1,1,1,1,1,10,11,1,1,1,1,1,1,10,10,10,10,11,10,10,10,10,10,1,1,10,11,10,10,10,10,10,11,12,10,1,1,10,11,10,10,12,10,10,10,10,10,1,1,1,1,1,1,13,13,1,1,1,1,1];
    //home room
    var map_10_10 = [1,1,1,1,1,1,1,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,12,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,1,1,1,1,1,1,1,1,1,1,1];
    //pillar room
    var map_11_10 = [1,1,1,1,3,1,2,2,3,2,1,1,1,10,10,3,2,10,10,10,10,1,2,1,1,10,10,10,10,10,10,3,10,10,10,1,1,10,10,10,10,10,10,10,10,7,10,2,1,10,10,10,2,10,10,10,10,10,10,3,10,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,10,10,2,1,10,10,10,10,10,10,10,10,10,10,2,1,10,10,6,10,10,10,6,10,10,10,3,1,10,10,5,10,10,10,5,10,10,10,1,1,4,10,10,10,10,10,10,10,10,4,2,1,1,1,1,13,13,13,1,1,1,2,2];
    //desert pond (below treasure room)
    var map_09_11 = [30,30,31,31,33,41,41,34,31,31,31,31,30,33,41,41,41,41,41,41,41,45,41,41,40,41,41,41,41,41,41,41,41,41,41,41,40,41,41,36,37,37,37,37,37,38,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,30,43,41,56,57,57,57,57,57,58,41,41,30,30,51,51,51,51,51,51,51,51,51,51];
    //desert trees (below home screen)
    var map_10_11 = [31,31,31,31,31,31,31,31,31,31,31,31,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,35,41,41,41,41,35,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,35,41,41,41,41,35,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,51,51,51,51,51,51,51,51,51,51,51,51];
    //desert tunnel, below pillar room
    var map_11_11 = [31,31,31,33,41,41,41,34,31,31,30,30,41,41,41,41,41,41,41,41,41,41,34,30,41,41,41,41,41,41,41,41,41,41,41,34,41,41,41,41,41,41,41,41,41,41,41,44,41,41,41,41,41,41,41,41,44,51,51,30,41,41,41,41,41,41,41,41,42,30,30,30,41,41,41,41,41,41,41,41,42,30,30,30,41,41,41,41,41,41,41,41,42,30,30,30,41,41,41,41,41,41,41,44,30,30,30,30,41,41,41,44,51,51,51,30,30,30,30,30,41,41,44,30,30,30,30,30,30,30,30,30,51,51,30,30,30,30,30,30,30,30,30,30];
    //secret room
    var map_09_12 = [30,30,31,31,31,31,31,31,31,31,30,30,30,33,41,36,37,37,37,37,37,38,34,30,40,41,41,46,47,47,47,47,47,48,41,42,40,41,41,46,47,47,47,47,47,48,41,42,40,41,41,46,47,47,47,57,57,58,41,42,40,41,41,46,47,47,48,41,41,41,41,42,40,41,41,46,47,47,48,41,35,41,41,42,40,41,41,56,57,57,58,41,41,41,41,42,40,41,41,41,41,41,41,41,41,41,41,42,40,41,41,41,35,41,41,41,35,41,41,42,30,43,41,41,41,41,41,41,41,41,44,30,30,30,51,51,51,51,51,51,51,51,30,30];

	var createGrid = function (gridData) {

		var levelWidth = 12;
		var levelHeight = 12;
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
				return 1; //A wall
			}
			return gridData[pos.y*levelWidth + pos.x]; 
		};

		grid.set = function (pos, value) {
			gridData[pos.y*levelWidth + pos.x] = value;
		}

		var wallTiles = [0, 1, 2, 3, 4, 5, 6, 8, 
			30, 31, 33, 34, 35, 40, 42, 43, 44, 51];
		var waterTiles = [36, 37, 38, 46, 47, 48, 56, 57, 58];
		var noteTiles = [7, 45];

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

		grid.raw = function () {
			return gridData;
		}

		return grid;
	}    

    var maps = []; //x[], then y[]
    maps[0] = []; 
    maps[0][0] = createGrid([41,41,44,31,31,31,31,31,31,31,31,31,41,44,33,41,41,41,41,41,41,41,41,41,44,33,41,41,41,41,41,41,41,41,41,41,40,41,41,41,41,41,41,41,41,41,41,41,40,41,41,41,41,41,41,41,41,35,41,41,33,41,41,41,41,41,41,41,41,41,41,41,37,37,37,37,37,37,37,37,37,37,37,37,47,47,47,47,47,47,47,47,47,47,47,47,57,57,57,57,57,57,57,57,57,57,57,57,41,41,41,41,41,41,41,41,41,41,41,41,41,45,41,45,41,45,41,45,41,45,32,45,32,41,32,41,41,41,41,41,41,41,41,41]);
    maps[9] = [];
    maps[10] = [];
    maps[11] = [];

	maps[10][9] = createGrid(map_10_09);

    maps[9][10] = createGrid(map_09_10);
    maps[10][10] = createGrid(map_10_10);
    maps[11][10] = createGrid(map_11_10);

    maps[9][11] = createGrid(map_09_11);
    maps[10][11] = createGrid(map_10_11);
    maps[11][11] = createGrid(map_11_11);

    maps[9][12] = createGrid(map_09_12);

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


    exports.canSurface = function(user) {
    	var map = this.getMap(user.map);
    	return !map.isUnderwaterTunnel(user.pos);
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