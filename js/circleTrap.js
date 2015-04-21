// circleTrap.js
"use strict";

var app = app || {};

app.CircleTrap = function() {
	var CIRCLE_TRAP_RADIUS = 40;
	var CIRCLE_TRAP_COLOR = "purple";
	var EMPTY_TRAP_COLOR = "white";
	var LASER_COLOR = "red";
	
	// x and y are the trap's coordinates
	var CircleTrap = function(x, y) {
		this.type = "circle";
		this.x = x;
		this.y = y;
		
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

		this.width = CIRCLE_TRAP_RADIUS*2;
		this.height = CIRCLE_TRAP_RADIUS*2;
		this.r = CIRCLE_TRAP_RADIUS;
		this.activeR = CIRCLE_TRAP_RADIUS * 2 + 20;
		this.fillCol = CIRCLE_TRAP_COLOR;
		
		this.strokeCol = "#9eaeb3";
		
		this.active = false;
		this.die = false;
	}
	
	var p = CircleTrap.prototype;
	
	p.draw = function(ctx) {
		// draw a circle
		ctx.save();
		app.draw.circle(ctx, this.x, this.y, this.r, 0, Math.PI*2, this.fillCol, this.strokeCol);
		ctx.restore();
		/* NOT USED
		// if the trap is not at its inventory location, draw a "shadow" there
		if(this.x != this.xInvLoc || this.y != this.yInvLoc) {
			ctx.save();
			ctx.globalAlpha = 0.8;
			app.draw.circle(ctx, this.xInvLoc, this.yInvLoc, this.r, this.EMPTY_TRAP_COLOR, this.EMPTY_TRAP_COLOR);
			ctx.restore();
		}
		*/
	};
	
	p.drawWhenActive = function(ctx) {
		if(this.active) {
			ctx.save();
			ctx.lineWidth = 3;
			app.draw.circle(ctx, this.x, this.y, this.activeR, 0, Math.PI*2, undefined, LASER_COLOR);
			ctx.restore();
		}
	};

	return CircleTrap;
}();