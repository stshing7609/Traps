// diamondTrap.js
"use strict";

var app = app || {};

app.DiamondTrap = function() {
	var DIAMOND_TRAP_RADIUS = 30;
	var DIAMOND_TRAP_COLOR = "green";
	var EMPTY_TRAP_COLOR = "white";
	var LASER_WIDTH = 3;
	var LASER_COLOR = "red";
	
	// x and y are the trap's coordinates
	// up, down, left, and right are bools that determine the direction the laser fires
	var DiamondTrap = function(x, y, up, down, left, right, hudHeight, divisorLinePos) {
		this.type = "diamond";
		this.hudHeight = hudHeight;
		this.divisorLinePos = divisorLinePos;
		this.x = x;
		this.y = y;
		
		// holds the location the object should be in the inventory
		this.xInvLoc = x;
		this.yInvLoc = y;
		
		// holds the location the object was previously before being picked up
		this.prevX = x;
		this.prevY = y;
		
		// the directions the trap fires
		this.up = up;
		this.down = down;
		this.left = left;
		this.right = right;
		
		// an objects of traps that this trap collides with when activated
		this.collideObjects = {
			up: undefined,
			down: undefined,
			right: undefined,
			left: undefined
		};
		
		// the row and column indices of the grid that the trap is in
		// -1 = the inventory
		this.rowIndex = -1;
		this.colIndex = -1;
		
		this.width = DIAMOND_TRAP_RADIUS*2;
		this.height = DIAMOND_TRAP_RADIUS*2;
		this.cornerSize = this.width / 3;
		this.r = DIAMOND_TRAP_RADIUS * Math.sqrt(2);
		this.fillCol = DIAMOND_TRAP_COLOR;
		this.strokeCol = "#9eaeb3";
		
		this.active = false;
		this.die = false;
	}
	
	var p = DiamondTrap.prototype;
	
	p.draw = function(ctx) {
		var cornerPath;
		// draw a diamond
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(app.utilities.degreesToRadians(45));
		app.draw.rect(ctx, -this.width/2, -this.height/2, this.width, this.height, this.fillCol, this.strokeCol);
		// draw triangles at the corners that can fire lasers
		if(this.up) {
			cornerPath = [{x:-this.width/2, y:-this.width/2},
						{x:-this.width/2 + this.cornerSize, y:-this.width/2},
						{x:-this.width/2, y:-this.width/2 + this.cornerSize}];
			app.draw.path(ctx, cornerPath, "blue");
		}
		if(this.down) {
			cornerPath = [{x:this.width/2, y:this.width/2},
						{x:this.width/2 - this.cornerSize, y:this.width/2},
						{x:this.width/2, y:this.width/2 - this.cornerSize}];
			app.draw.path(ctx, cornerPath, "blue");
		}
		if(this.right) {
			cornerPath = [{x:this.width/2, y:-this.width/2},
						{x:this.width/2 - this.cornerSize, y:-this.width/2},
						{x:this.width/2, y:-this.width/2 + this.cornerSize}];
			app.draw.path(ctx, cornerPath, "blue");
		}
		if(this.left) {
			cornerPath = [{x:-this.width/2, y:this.width/2},
						{x:-this.width/2 + this.cornerSize, y:this.width/2},
						{x:-this.width/2, y:this.width/2 - this.cornerSize}];
			app.draw.path(ctx, cornerPath, "blue");
		}
		ctx.restore();
		/* NOT USED
		// if the trap is not at its inventory location, draw a "shadow" there
		if(this.x != this.xInvLoc || this.y != this.yInvLoc) {
			ctx.save();
			ctx.globalAlpha = 0.8;
			ctx.translate(this.xInvLoc, this.yInvLoc);
			ctx.rotate(app.utilities.degreesToRadians(45));
			app.draw.rect(ctx, -this.width/2, -this.height/2, this.width, this.height, this.EMPTY_TRAP_COLOR, this.EMPTY_TRAP_COLOR);
			ctx.restore();
		}
		*/
	};
	
	p.drawWhenActive = function(ctx) {
		if(this.active) {
			ctx.save();
			// if the diamond shoots up and there is no object above it, draw the laser to the HUD
			if(this.up && this.collideObjects.up == undefined) {
				// add 6 to hudHeight to account for the width of the line
				app.draw.rect(ctx, this.x, this.y - this.r, LASER_WIDTH, (this.hudHeight + 6) - this.y + this.r, LASER_COLOR, LASER_COLOR);
			}
			// otherwise if the diamond shoots up and there is an object, draw the laser to that object
			else if(this.up) {
				app.draw.rect(ctx, this.x, this.y - this.r, LASER_WIDTH, (this.collideObjects.up.y + this.collideObjects.up.r) - (this.y - this.r), LASER_COLOR, LASER_COLOR);
			}
			// if the diamond shoots down and there is no object below it, draw the laser to the bottom of the canvas
			if(this.down && this.collideObjects.down == undefined) {
				app.draw.rect(ctx, this.x, this.y + this.r, LASER_WIDTH, app.HEIGHT - this.y - this.r, LASER_COLOR, LASER_COLOR);
			}
			// otherwise if the diamond shoots down and there is an object, draw the laser to that object
			else if(this.down) {
				app.draw.rect(ctx, this.x, this.y + this.r, LASER_WIDTH, (this.collideObjects.down.y - this.collideObjects.down.r) - (this.y + this.r), LASER_COLOR, LASER_COLOR);
			}
			// if the diamond shoots right and there is no object right of it, draw the laser to the right of the canvas
			if(this.right && this.collideObjects.right == undefined) {
				app.draw.rect(ctx,this.x + this.r, this.y, app.WIDTH - this.x - this.r, LASER_WIDTH, LASER_COLOR, LASER_COLOR);
			}
			// otherwise if the diamond shoots right and there is an object, draw the laser to that object
			else if(this.right) {
				app.draw.rect(ctx, this.x + this.r, this.y, (this.collideObjects.right.x - this.collideObjects.right.r) - (this.x + this.r), LASER_WIDTH, LASER_COLOR, LASER_COLOR);
			}
			// if the diamond shoots left and there is no object left of it, draw the laser to the line that divides the inventory and the playing field
			if(this.left && this.collideObjects.left == undefined) {
				// to draw the line correctly from the trap to the dividing line, draw in the negative direction
				// add 6 to the position of the line to account for the width of the line
				app.draw.rect(ctx,this.x - this.r, this.y, -(this.x - this.r - this.divisorLinePos) + 6, LASER_WIDTH, LASER_COLOR, LASER_COLOR);
			}
			// otherwise if the diamond shoots right and there is an object, draw the laser to that object
			else if(this.left) {
				app.draw.rect(ctx, this.x - this.r, this.y, -((this.x - this.r) - (this.collideObjects.left.x + this.collideObjects.left.r)), LASER_WIDTH, LASER_COLOR, LASER_COLOR);
			}
			ctx.restore();
		} // end if active
	};

	return DiamondTrap;
}();