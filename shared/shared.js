
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

    var map_09_10 = function () {
		var gridData = [];
		gridData[ 0] = "xxxxxxxxxxxx";
		gridData[ 1] = "x          x";
		gridData[ 2] = "x          x";
		gridData[ 3] = "x  z       x";
		gridData[ 4] = "xxxxx  xxxxx";
		gridData[ 5] = "x           ";
		gridData[ 6] = "x         , ";
		gridData[ 7] = "xxxxx .xxxxx";
		gridData[ 8] = "x    .     x";
		gridData[ 9] = "x       ., x";
		gridData[10] = "x .  ,     x";
		gridData[11] = "xxxxx .xxxxx";
		return gridData;
    }

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

    var map_11_10 = function () {
		var gridData = [];
		gridData[ 0] = "xxxxvxccvcxx";
		gridData[ 1] = "x  vc    xcx";
		gridData[ 2] = "x      v   x";
		gridData[ 3] = "x          c";
		gridData[ 4] = "x   c      v";
		gridData[ 5] = "           x";
		gridData[ 6] = "           c";
		gridData[ 7] = "x          c";
		gridData[ 8] = "x          v";
		gridData[ 9] = "x  m   m   x";
		gridData[10] = "x bn   nb  c";
		gridData[11] = "xxxx   xxxcc";
		return gridData;
    }

    var map_09_11 = function () {
		var gridData = [];
		gridData[ 0] = "xxxxx .xxxxx";
		gridData[ 1] = "x.     x,   ";
		gridData[ 2] = "x   ,  x   .";
		gridData[ 3] = "x  xxxxx  , ";
		gridData[ 4] = "x           ";
		gridData[ 5] = "x xxxxxxx   ";
		gridData[ 6] = "x x     xxxx";
		gridData[ 7] = "x    x      ";
		gridData[ 8] = "xxxxxxxxxxxx";
		gridData[ 9] = "x           ";
		gridData[10] = "x           ";
		gridData[11] = "xxxxxxxxxxxx";
		return gridData;
    }

    var map_10_11 = function () {
		var gridData = [];
		gridData[ 0] = "xxxxxxxxxxxx";
		gridData[ 1] = ".           ";
		gridData[ 2] = "            ";
		gridData[ 3] = "   .        ";
		gridData[ 4] = "  xxxxx     ";
		gridData[ 5] = ", x   x     ";
		gridData[ 6] = "xxx,  x     ";
		gridData[ 7] = "      x     ";
		gridData[ 8] = "xx    xxxxxx";
		gridData[ 9] = "            ";
		gridData[10] = "            ";
		gridData[11] = "xxxxxxxxxxxx";
		return gridData;
    }

    var map_11_11 = function () {
		var gridData = [];
		gridData[ 0] = "xxxx   xxxcc";
		gridData[ 1] = "           x";
		gridData[ 2] = "   m   m   c";
		gridData[ 3] = "   n   n   v";
		gridData[ 4] = "           x";
		gridData[ 5] = "           x";
		gridData[ 6] = "   m   m   x";
		gridData[ 7] = "   n   n   x";
		gridData[ 8] = "xxxxxcxxvxvc";
		gridData[ 9] = "           v";
		gridData[10] = "           x";
		gridData[11] = "xxxvxccxvcvx";
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
			if (tile === "z") return false;
			if (tile === "x") return false;
			if (tile === "c") return false;
			if (tile === "v") return false;
			if (tile === "b") return false;
			if (tile === "n") return false;
			if (tile === "m") return false;
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