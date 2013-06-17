
(function(exports){

	exports.Pos = function(x, y) {
	    this.x = x;
	    this.y = y;
	    this.toString = function() {
	        return "(" + this.x + "," + this.y + ")";
	    }
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

    var map_home = function () {
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
		gridData[ 9] = "x          x";
		gridData[10] = "x          x";
		gridData[11] = "xxxxxxxxxxxx";
		return gridData;
    }

    var map_east = function () {
		var gridData = [];
		gridData[ 0] = "xxxxxxxxxxxx";
		gridData[ 1] = "x        xxx";
		gridData[ 2] = "x      x   x";
		gridData[ 3] = "x          x";
		gridData[ 4] = "x   x      x";
		gridData[ 5] = "           x";
		gridData[ 6] = "           x";
		gridData[ 7] = "x    x     x";
		gridData[ 8] = "x          x";
		gridData[ 9] = "x      x   x";
		gridData[10] = "x       x  x";
		gridData[11] = "xxxxxxxxxxxx";
		return gridData;
    }

    var map_west = function () {
		var gridData = [];
		gridData[ 0] = "xxxxxxxxxxxx";
		gridData[ 1] = "x          x";
		gridData[ 2] = "x          x";
		gridData[ 3] = "x          x";
		gridData[ 4] = "xxxxx  xxxxx";
		gridData[ 5] = "x           ";
		gridData[ 6] = "x           ";
		gridData[ 7] = "xxxxx  xxxxx";
		gridData[ 8] = "x          x";
		gridData[ 9] = "x          x";
		gridData[10] = "x          x";
		gridData[11] = "xxxxxxxxxxxx";
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

		grid.isWalkable = function (pos) {
			var tile = this.get(pos);
			if (tile === "x") return false;
			return true;
		}

		grid.getWidth = function () {
			return levelWidth;
		}

		grid.getHeight = function () {
			return levelHeight;
		}

		return grid;
	}    

    var maps = [];
    maps[0] = [];
    maps[0][0] = createGrid(map_home());
    maps[1] = [];
    maps[1][0] = createGrid(map_east());
    maps[-1] = [];
    maps[-1][0] = createGrid(map_west());

    exports.getMap = function (pos) {
    	return maps[pos.x][pos.y];
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
	            //undo move
	            user.pos.x -= x;
	            user.pos.y -= y;
	            return false;
        	}
        	return true;
        }

        //normal movement
        if (map.isWalkable(user.pos) === false) {
            //undo move
            user.pos.x -= x;
            user.pos.y -= y;
            return false;
        }
        return true;
    }

})(typeof exports === 'undefined'? this['shared']={}: exports);