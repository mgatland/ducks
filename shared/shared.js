
(function(exports){

	exports.Pos = function(x, y) {
	    this.x = x;
	    this.y = y;
	    this.toString = function() {
	        return "(" + this.x + "," + this.y + ")";
	    }
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

	var createGrid = function (gridData) {

		var levelWidth = gridData[0].length;
		var levelHeight = gridData.length;

		var grid = {};

		grid.isValid = function (pos) {
			if (pos.x < 0 || pos.x >= levelWidth) {
				return false;
			}
			if (pos.y < 0 || pos.y >= levelHeight) {
				return false;	
			}
			return true;
		}

		grid.get = function (pos) {
			if (!this.isValid(pos)) {
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

    exports.getMap = function (pos) {
    	return maps[pos.x][pos.y];
    }

    exports.move = function (user, x, y) {
        user.pos.x += x;
        user.pos.y += y;
        if (this.getMap(user.map).isWalkable(user.pos) === false) {
            //undo move
            user.pos.x -= x;
            user.pos.y -= y;
            return false;
        }
        return true;
    }

})(typeof exports === 'undefined'? this['shared']={}: exports);