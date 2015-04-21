// tearTrap.js
"use strict";

var app = app || {};

app.TearTrap = function() {
	var TEAR_TRAP_RADIUS = 40;
	var TEAR_TRAP_COLOR = "cyan";
	var EMPTY_TRAP_COLOR = "white";
	var LASER_COLOR = "red";
	
	// x and y are the trap's coordinates, direction is the direction the trap faces - up:0, down:1, left:2, right:3
	var TearTrap = function(x, y, direction) {
		this.type = "tear";
		this.x = x;
		this.y = y;
		this.direction = direction;
		
		// holds the location the object should be in the inventory
		this.xInvLoc = x;
		this.yInvLoc = y;
		
		// holds the location the object was previously before being picked up
		this.prevX = x;
		this.prevY = y;
		
		// the row and column indices of the grid that the trap is in
		// -1 = the inventory
		this.rowIndex = -1;
		this.colIndex = -1;

		this.width = TEAR_TRAP_RADIUS*2;
		this.height = TEAR_TRAP_RADIUS*2;
		this.r = TEAR_TRAP_RADIUS;
		this.circR = TEAR_TRAP_RADIUS - TEAR_TRAP_RADIUS/2;
		this.activeObj = {};
		this.fillCol = TEAR_TRAP_COLOR;
		
		this.strokeCol = "#9eaeb3";
		
		this.active = false;
		this.die = false;
	}
	
	var p = TearTrap.prototype;
	
	p.draw = function(ctx) {
		var tipPath;
		// draw a tear
		ctx.save();
		// draw the circle part of the tear
		app.draw.circle(ctx, this.x, this.y, this.circR, 0, Math.PI * 2, this.fillCol, this.strokeCol);
		// draw the triangle part of the tear
		// up
		if(this.direction == "up") {
			tipPath = [{x:this.x, y: this.y - this.r},
							{x:this.x - this.circR, y:this.y},
							{x:this.x + this.circR, y:this.y}];
		}
		// down
		else if(this.direction == "down") {
			tipPath = [{x:this.x, y: this.y + this.r},
							{x:this.x - this.circR, y:this.y},
							{x:this.x + this.circR, y:this.y}];
		}
		// left
		else if(this.direction == "left") {
			tipPath = [{x:this.x - this.r, y: this.y},
							{x:this.x, y:this.y - this.circR},
							{x:this.x, y:this.y + this.circR}];
		}
		// right
		else {
			tipPath = [{x:this.x + this.r, y: this.y},
							{x:this.x, y:this.y - this.circR},
							{x:this.x, y:this.y + this.circR}];
		}
		app.draw.path(ctx, tipPath, this.fillCol);
		ctx.restore();
	};
	
	p.drawWhenActive = function(ctx) {
		if(this.active) {
			ctx.save();
			ctx.lineWidth = 3;
			// fill the circle with a slightly alpha'd out red
			app.draw.circle(ctx, this.activeObj.x, this.activeObj.y, this.circR, 0, Math.PI * 2, LASER_COLOR, LASER_COLOR);
			ctx.restore();
		}
	};
	
	return TearTrap;
}();