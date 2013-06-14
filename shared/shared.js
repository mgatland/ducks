
(function(exports){

   exports.getIndexOfUser = function (name, users) {
        var index = null;
        users.forEach(function(user, idx) {
            if (user.name === name) {
                index = idx;
            }
        });
        return index;
    }

	var createGrid = function () {
		var gridData = [];
		gridData[ 0] = "xxxxxxxxxxxx";
		gridData[ 1] = "x          x";
		gridData[ 2] = "x          x";
		gridData[ 3] = "x          x";
		gridData[ 4] = "x          x";
		gridData[ 5] = "x          x";
		gridData[ 6] = "x          x";
		gridData[ 7] = "x          x";
		gridData[ 8] = "x          x";
		gridData[ 9] = "x          x";
		gridData[10] = "x          x";
		gridData[11] = "xxxxxxxxxxxx";

		exports.levelWidth = gridData[0].length;
		exports.levelHeight = gridData.length;

		var grid = {};

		grid.isValid = function (pos) {
			if (pos.x < 0 || pos.x >= exports.levelWidth) {
				return false;
			}
			if (pos.y < 0 || pos.y >= exports.levelHeight) {
				return false;	
			}
			return true;
		}

		grid.get = function (pos) {
			if (!this.isValid(pos.x, pos.y)) {
				return "x";
			}
			return gridData[pos.x][pos.y]; 
		};

		grid.isWalkable = function (pos) {
			var tile = this.get(pos);
			if (tile === "x") return false;
			return true;
		}

		return grid;
	}    

    var map = createGrid();

    exports.getMap = function () {
    	return map;
    }

    exports.move = function (user, x, y) {
        user.pos.x += x;
        user.pos.y += y;
        if (map.isWalkable(user.pos) === false) {
            //undo move
            user.pos.x -= x;
            user.pos.y -= y;
            return false;
        }
        return true;
    }

})(typeof exports === 'undefined'? this['shared']={}: exports);