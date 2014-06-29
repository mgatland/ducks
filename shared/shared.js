
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

    exports.posIsAt = function (pos, x, y) {
        return (pos.x === x && pos.y === y);
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

    var Note = function (x, y, number) {
        this.x = x;
        this.y = y;
        this.number = number;
    }

    //Lair of Deception!
    var map_10_08 = [15,15,15,15,15,15,15,15,15,15,15,15,15,14,14,14,14,14,14,14,14,14,14,15,15,14,15,14,15,14,15,14,14,14,14,15,15,14,15,14,15,14,15,14,15,15,15,15,15,14,15,14,15,15,15,14,14,14,14,15,15,14,15,14,15,14,15,15,15,15,14,15,15,14,14,14,15,14,14,14,14,14,14,15,15,15,14,15,15,15,15,15,15,15,15,15,15,14,14,15,14,14,14,14,14,14,14,15,15,14,15,15,14,15,15,15,15,15,14,15,15,14,14,14,14,15,14,14,14,14,14,15,15,15,15,15,15,15,14,15,15,15,15,15];
    var map_09_09 = [15,15,15,15,15,15,15,15,15,15,15,15,15,14,14,14,14,14,14,14,14,14,14,15,15,14,17,14,14,14,14,14,14,14,15,15,15,14,14,14,14,14,14,14,14,14,14,14,15,14,17,14,14,14,14,14,14,14,15,15,15,14,14,14,14,14,14,14,18,14,14,15,15,14,17,14,14,14,14,14,14,14,14,15,15,14,14,14,14,14,14,14,18,14,14,15,15,14,14,14,14,14,14,14,14,14,14,14,15,14,14,14,14,14,14,14,18,14,14,15,15,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,15,15];
    var map_10_09 = [15,15,15,15,15,15,14,15,15,15,15,15,15,14,14,14,14,14,14,14,14,14,14,15,15,14,14,14,16,14,16,14,16,14,16,15,14,14,14,14,14,14,14,14,14,14,14,15,15,14,14,14,16,14,16,14,16,14,16,15,15,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,14,14,14,14,14,14,14,14,14,14,15,14,14,14,14,14,14,14,14,14,14,14,15,15,14,14,14,14,14,14,14,14,14,14,15,15,14,14,14,14,17,14,18,14,14,14,15,15,15,15,15,15,15,14,15,15,15,15,15];
    //chest room
    var map_09_10 = [1,1,1,1,1,1,1,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,7,10,10,1,1,10,10,0,10,10,10,10,10,10,10,1,1,1,1,1,1,10,10,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,12,10,1,1,1,1,1,10,11,1,1,1,1,1,1,10,10,10,10,11,10,10,10,10,10,1,1,10,11,10,10,10,10,10,11,12,10,1,1,10,11,10,10,12,10,10,10,10,10,1,1,1,1,1,1,13,13,1,1,1,1,1];
    //home room
    var map_10_10 = [1,1,1,1,1,1,2,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,10,12,10,10,10,10,10,10,10,10,1,1,10,10,10,10,10,10,10,10,10,10,1,1,1,1,1,1,1,1,1,1,1,1,1];
    //pillar room
    var map_11_10 = [1,1,1,1,3,1,2,2,3,2,1,1,1,10,10,3,2,10,10,10,10,1,2,1,1,10,10,10,10,10,10,3,10,10,10,1,1,10,10,10,10,10,10,10,10,7,10,2,1,10,10,10,2,10,10,10,10,10,10,3,10,10,10,10,10,10,10,10,10,10,10,1,10,10,10,10,10,10,10,10,10,10,10,2,1,10,10,10,10,10,10,10,10,10,10,2,1,10,10,6,10,10,10,6,10,10,10,3,1,10,10,5,10,10,10,5,10,10,10,1,1,4,10,10,10,10,10,10,10,10,4,2,1,1,1,1,13,13,13,1,1,1,2,2];
    //desert pond (below treasure room)
    var map_09_11 = [30,30,31,31,33,41,41,34,31,31,31,31,30,33,41,41,41,41,41,41,41,45,41,41,40,41,41,41,41,41,41,41,41,41,41,41,40,41,41,36,37,37,37,37,37,38,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,40,41,41,46,47,47,47,47,47,48,41,41,30,43,41,56,57,57,57,57,57,58,41,41,30,30,51,51,51,51,51,51,51,51,51,51];
    //desert trees (below home screen)
    var map_10_11 = [31,31,31,31,31,31,31,31,31,31,31,31,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,35,41,41,41,41,35,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,35,41,41,41,41,35,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,51,51,51,51,51,51,51,51,51,51,51,51];


    //secret room
    var map_09_12 = [30,30,31,31,31,31,31,31,31,31,30,30,30,33,41,36,37,37,37,37,37,38,34,30,40,41,41,46,47,47,47,47,47,48,41,42,40,41,41,46,47,47,47,47,47,48,41,42,40,41,41,46,47,47,47,57,57,58,41,42,40,41,41,46,47,47,48,41,41,41,41,42,40,41,41,46,47,47,48,41,35,41,41,42,40,41,41,56,57,57,58,41,41,41,41,42,40,41,41,41,41,41,41,41,41,41,41,42,40,41,41,41,35,41,41,41,35,41,41,42,30,43,41,41,41,41,41,41,41,41,44,30,30,30,51,51,51,51,51,51,51,51,30,30];

	var createGrid = function (gridData, notes, doorDestination) {

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

		var wallTiles = [
			0, 1, 2, 3, 4, 5, 6, 8, 
			15, 16, 17, 18,
			30, 31, 32, 33, 34, 35, 
			40, 42, 43, 44, 
			51, 52,
			60, 61, 63, 64,
			70, 72, 73, 74,
			81,
            90, 91, 93, 94, 95, 
            100, 102, 103, 104, 
            111, 112,];

        var doorTiles = [55];

		var waterTiles = [36, 37, 38, 46, 47, 48, 56, 57, 58,
                          96, 97, 98, 106, 107, 108, 116, 117, 118];
		var noteTiles = [7, 19, 45, 105];
        var npcTiles = [92, 113];

		grid.isWalkable = function (pos) {
			var tile = this.get(pos);
			if (wallTiles.indexOf(tile) !== -1) return false;
            if (npcTiles.indexOf(tile) !== -1) return false;
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

        grid.isNPC = function (pos) {
            var tile = this.get(pos);
            if (npcTiles.indexOf(tile) !== -1) return true;
            return false;
        }

        grid.isDoor = function (pos) {
            var tile = this.get(pos);
            if (doorTiles.indexOf(tile) !== -1) return true;
            return false;
        }

        grid.getDoorDestination = function () {
            if (doorDestination == null) {
                console.log("Error: This map has no door destination");
                return new exports.Pos(10, 10);
            }
            return doorDestination;
        }

        grid.getDoorPos = function () {
            for (var i = 0; i < gridData.length; i++) {
                var tile = gridData[i];
                if (doorTiles.indexOf(tile) !== -1) {
                    return new exports.Pos(i % levelWidth, Math.floor(i / levelWidth));
                }
            }
            console.log("Error: Taking door to room with no door.");
            return new exports.Pos(5,5);
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

        grid.getNote = function (pos) {
            var noteNum = null;
            if (notes) {
                notes.forEach(function (note) {
                    if (exports.posAreEqual(note, pos)) {
                        noteNum = note.number;
                    }
                });
            }
            return noteNum;
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
    maps[9] = [];
    maps[10] = [];
    maps[11] = [];
    maps[12] = [];
    maps[13] = [];

    //title screen
    maps[0][0] = createGrid([41,41,44,31,31,31,31,31,31,31,31,31,41,44,33,41,41,41,41,41,41,41,41,41,44,33,41,41,41,41,41,41,41,41,41,41,40,41,41,41,41,41,41,41,41,41,41,41,40,41,41,41,41,41,41,41,41,35,41,41,33,41,41,41,41,41,41,41,41,41,41,41,37,37,37,37,37,37,37,37,37,37,37,37,47,47,47,47,47,47,47,47,47,47,47,47,57,57,57,57,57,57,57,57,57,57,57,57,41,41,41,41,41,41,41,41,41,41,41,41,41,45,41,45,41,45,41,45,41,45,41,45,41,41,41,41,41,41,41,41,41,41,41,41]);

    //Cave with forest spirit (connects to forest)
    maps[0][1] = createGrid(
        [90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,90,100,101,101,101,101,101,101,101,101,101,101,102,100,101,101,101,101,113,101,101,101,101,101,102,100,101,101,101,101,101,101,101,101,101,101,102,100,101,101,101,101,101,101,101,101,101,101,102,100,101,101,101,101,101,101,101,101,101,101,102,90,111,111,111,111,55,111,111,111,111,111,90]
        ,null, new exports.Pos(12, 12));

    maps[10][8] = createGrid(map_10_08);

    //Lair of Deception - room with 6 duck head statues
    notes_statueroom = [];
    notes_statueroom.push(new Note(3,2,"statue1"));
    notes_statueroom.push(new Note(3,4,"statue2"));
    notes_statueroom.push(new Note(3,6,"statue3"));
    notes_statueroom.push(new Note(7,5,"statue4"));
    notes_statueroom.push(new Note(7,7,"statue5"));
    notes_statueroom.push(new Note(7,9,"statue6"));
    maps[9][9] = createGrid(map_09_09, notes_statueroom);

    //Lair of Deception - room in two parts with 8 tombs (?) and 2 duck heads
    notes_10_09 = [];
    notes_10_09.push(new Note(4,3,"crypt1"));
    notes_10_09.push(new Note(6,3,"crypt2"));
    notes_10_09.push(new Note(8,3,"crypt3"));
    notes_10_09.push(new Note(10,3,"crypt4"));
    notes_10_09.push(new Note(4,5,"crypt5"));
    notes_10_09.push(new Note(6,5,"crypt6"));
    notes_10_09.push(new Note(8,5,"crypt7"));
    notes_10_09.push(new Note(10,5,"crypt8"));
    notes_10_09.push(new Note(6,0,"cryptEntrance"));
    notes_10_09.push(new Note(6,10,"statue7"));
	maps[10][9] = createGrid(map_10_09, notes_10_09);

    maps[9][10] = createGrid(map_09_10);
    maps[10][10] = createGrid(map_10_10);
    maps[11][10] = createGrid(map_11_10);
    //Cave with mouse NPC
    maps[13][10] = createGrid(
        [90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,90,100,101,101,101,101,101,101,101,101,101,101,102,100,101,101,101,101,92,101,101,101,101,101,102,100,101,101,101,101,101,101,101,101,101,101,102,100,101,101,101,101,101,101,101,101,101,101,102,100,101,101,101,101,101,101,101,101,101,101,102,90,111,111,111,111,55,111,111,111,111,111,90]
        ,null, new exports.Pos(13, 11));

    maps[9][11] = createGrid(map_09_11);
    maps[10][11] = createGrid(map_10_11);

    //desert echo area (below pillar room)
    maps[11][11] = createGrid([31,31,31,33,41,41,41,34,31,31,30,30,41,41,41,41,41,41,41,41,41,41,34,31,41,41,41,41,41,41,41,41,41,41,41,41,41,52,41,41,41,52,41,41,41,41,41,41,41,41,41,41,41,41,41,41,44,51,51,51,41,41,41,52,41,41,41,41,42,30,30,30,41,41,41,41,41,52,41,41,42,30,30,30,41,52,41,41,41,41,41,41,42,30,30,30,41,41,41,41,41,41,41,44,30,30,30,30,41,41,41,44,51,51,51,30,30,30,30,30,41,41,44,30,30,30,30,30,30,30,30,30,51,51,30,30,30,30,30,30,30,30,30,30]);
    //desert passage with ladder down
    maps[12][11] = createGrid([30,30,30,31,31,31,31,31,30,30,30,30,31,31,33,41,41,41,41,41,34,31,31,31,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,51,51,43,41,41,41,41,41,44,51,51,51,30,30,30,43,41,41,41,44,30,30,30,30,30,30,30,30,51,50,51,51,51,30,30,30,30,30,30,30,30,50,30,30,30,30,30,30,30,30,30,30,30,50,30,30,30,30,30,30,30,30,30,30,30,50,51,30,30,30,30,30,30,30,30,30,30,50,30,30,30,30,30,30,30,30,30,30,30,50,30,30,30,30,30,30]);
    //end of desert passage (door to Mouse)
    maps[13][11] = createGrid(
        [30,30,30,31,31,55,31,31,30,30,30,30,31,31,33,41,41,41,41,41,34,31,31,31,41,41,41,41,41,41,41,41,41,52,41,41,41,41,41,41,41,41,41,41,41,52,41,41,51,51,43,41,41,41,41,41,44,51,51,51,30,30,30,43,41,41,41,44,30,30,30,30,30,30,30,30,51,51,51,51,51,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,51,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]
        , null, new exports.Pos(13, 10));
    //secret pond
    maps[9][12] = createGrid(map_09_12);
    //forest at the bottom of desert ladder
    maps[12][12] = createGrid(
        [30,30,30,30,30,50,30,30,30,30,30,30,30,30,30,30,30,50,30,30,30,30,30,30,30,30,30,30,30,50,30,30,30,30,30,30,30,30,30,30,30,50,30,30,30,30,30,30,30,30,30,31,31,50,31,31,55,31,30,30,81,81,81,73,41,41,41,41,41,41,41,74,60,60,60,70,41,41,41,41,41,41,41,72,60,60,60,70,41,41,41,41,74,73,41,72,60,60,60,70,41,41,41,41,64,63,41,72,60,60,60,70,41,41,41,41,41,41,41,72,60,60,60,60,73,41,41,41,41,41,74,60,60,60,60,60,60,81,81,81,81,81,60,60]
        , null, new exports.Pos(0, 1));


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

    exports.getMapNoteForUser = function (user) {
        var map = this.getMap(user.map);
        return map.getNote(user.pos);
    }

    exports.isUserBelowNPC = function (user) {
        var map = this.getMap(user.map);
        if (map.isNPC({x:user.pos.x, y:user.pos.y - 1}) === true) {
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
        var wasOnDoor = map.isDoor(user.pos);

    	if (user.act === 'nap') {
    		user.act = false;
    		return true; //wake up, but don't move.
    	}

        user.pos.x += x;
        user.pos.y += y;

        
        //map transitions (note, don't allow leaving the map from a door)
        if (!wasOnDoor && map.isInMap(user.pos) === false) {
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

        //walking from a door into a wall teleports you
        if (wasOnDoor && !map.isWalkable(user.pos)) {
            user.map = map.getDoorDestination();
            user.pos = this.getMap(user.map).getDoorPos();
            return true;
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