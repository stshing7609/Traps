// cell.js
"use strict";

var app = app || {};

app.Cell = function() {
	var Cell = function(size, centerX, centerY) {
		this.obj = undefined;
		this.width = this.height = size;
		// this is an object that holds the coord of a center point {x, y}
		this.center = {
			x: centerX,
			y: centerY
		};
	}
	
	var p = Cell.prototype;
	
	// draw a dot at the center of the cell
	p.draw = function(ctx) {
		ctx.save();
		ctx.globalAlpha = 0.5;
		app.draw.circle(ctx, this.center.x, this.center.y, 4, 0, Math.PI * 2, "#fdfdfd", "black");
		ctx.restore();
	}
	
	return Cell;
}();