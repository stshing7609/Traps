/*
	Name: gameScreen.js
	Author: Steven Shing
	Notes: Search '~' for debug comments and notes for things to change
*/
"use strict";

var app = app || {};

app.gameScreen = {
	// constants
	// states
	GAME_STATE_BEGIN: 0,				// inactive game state
	GAME_STATE_DEFAULT: 1,				// inactive game state
	GAME_STATE_SETUP: 2,				// active game state
	GAME_STATE_DEMOLITION: 3,			// active game state
	GAME_STATE_DEMOLISHING: 4,			// active game state
	GAME_STATE_DEMOLITION_DONE: 5,		// active game state
	GAME_STATE_LEVEL_END: 6,			// inactive game state
	GAME_STATE_END: 7,					// inactive game state
	
	HUD_HEIGHT: 80,					// the height of the HUD
	GRID_CELL_SIZE: 120,			// the size of a single cell - depends on max size
	PLAYING_FIELD_SIZE: 720,		// the size of the playing field
	DIVISOR_LINE_POS: app.WIDTH/4,	// the position of the line that divides the inventory and the playing field - is an xPos
	
	// animating exploding traps
	TRAP_EXPLODE_LIFETIME: 150,
	TRAP_PULSE_LIFETIME: 30,
	
	DEFAULT_TRAP_VALUE: 10,
	
	canvas: undefined,
	ctx: undefined,
	gameState: undefined,
	
	// traps
	traps: [],
	// ~There will be a max of 4 positions. - for now
	inventoryPositions: [],
	
	// grid
	// number of cells in a single row
	grid: undefined,
	numRows: undefined,
	numCols: undefined,
	
	// level handling
	currentLevel: 0,
	numLevels: 0,
	lostLevel: false,
	
	// handling exploding traps
	trapLifetime: 0,
	pulses: [],
	
	// score
	timer: 0,
	timerObj: {},
	bestTimeObj: {},
	/*
	 * SCORE IS OUTDATED
	score: 0,
	prevScore: 0,
	highScore: 0,
	chainMultiplier: 1,
	*/
	
	// mouse related stuff
	dragIndex: 0,
	dragging: false,
	mouse: undefined,
	dragHoldX: undefined,
	dragHoldY: undefined,
	dragPosX: undefined,
	dragPosY: undefined,
	rad: undefined,
	mouseDownBind: undefined,
	mouseUpBind: undefined,
	mouseMoveBind: undefined,
	
	init: function(canvas, ctx) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.numLevels = app.levels.length;
		
		var invStartX = 50;
		var invStartY = this.HUD_HEIGHT + 60;
		var invDistY = 130;
		
		// set up the starting inventory positions
		this.inventoryPositions = [
			{x: invStartX, y: invStartY},
			{x: invStartX, y: invStartY + invDistY},
			{x: invStartX, y: invStartY + invDistY*2},
			{x: invStartX, y: invStartY + invDistY*3},
			{x: invStartX, y: invStartY + invDistY*4}
		];
		
		// set up the grid
		this.numRows = this.numCols = this.PLAYING_FIELD_SIZE / this.GRID_CELL_SIZE;
		this.makeGrid();
		
		// keep track of any eventListener binds
		this.mouseDownBind = this.doMousedown.bind(this);
		this.mouseUpBind = this.doMouseup.bind(this);
		this.mouseMoveBind = this.doMousemove.bind(this);
	},
	
	update: function(dt) {
		
		/*
		// ~Used for debugging - automatically completes the current level
		if((this.gameState == this.GAME_STATE_SETUP || this.gameState == this.GAME_STATE_DEMOLITION) && app.keydown[app.KEYBOARD.KEY_F8]) {
			this.gameState = this.GAME_STATE_DEMOLITION_DONE;
			this.traps = [];
		}
		*/
		
		
		// Pressin 'r' resets the level
		if((this.gameState == this.GAME_STATE_SETUP || this.gameState == this.GAME_STATE_DEMOLITION) && app.keydown[app.KEYBOARD.KEY_R] && !this.dragging) {
			this.gameState = this.GAME_STATE_SETUP;
			/*
			 * SCORE IS OUTDATED
			this.score = this.prevScore;
			*/
			this.levelReset();
		}
	
		// if the game is active
		if(this.gameState >= this.GAME_STATE_SETUP && this.gameState <= this.GAME_STATE_DEMOLITION_DONE) {
			// increase the timer every frame
			this.timer += dt;
			// make a new timer object with the current timer, floored to remove decimals
			this.timerObj = app.utilities.secondsToTime(Math.floor(this.timer));
		}
		
		// Pressing 'Space' starts GAME_STATE_DEMOLITION
		if(this.gameState == this.GAME_STATE_SETUP && app.keydown[app.KEYBOARD.KEY_SPACE] && !this.dragging) this.gameState = this.GAME_STATE_DEMOLITION;
		
		// make a lot of checks if we're done with our current demolition stage
		if(this.gameState == this.GAME_STATE_DEMOLITION_DONE) {
			// if there are no traps left, we complete the level
			if(this.traps.length == 0) {
				this.gameState = this.GAME_STATE_LEVEL_END;
				/*
				 * SCORE IS OUTDATED
				// update prevScore and highScore
				this.prevScore = this.score;
				this.highScore = (this.score > this.highScore) ? this.score : this.highScore;
				*/
				// move onto the next level
				this.currentLevel++;
				// if there is no next level, then we won the game
				if(this.currentLevel > (this.numLevels - 1)) {
					this.gameState = this.GAME_STATE_END;
					// update high scores
					/*
					 * SCORE IS OUTDATED
					var storedHighScore = localStorage.getItem('highScore');
					*/
					var storedBestTimeObj = JSON.parse(localStorage.getItem('bestTimeObj'));
					
					/*
					 * SCORE IS OUTDATED
					// if there is no high store, store it OR if high score does exist and high score is greater than the stored value, override
					if(storedHighScore == undefined || (storedHighScore != undefined && this.highScore > storedHighScore)) {
						localStorage.setItem('highScore', JSON.stringify(this.highScore));
					}
					
					// also set the current score
					localStorage.setItem('currScore', JSON.stringify(this.score));
					*/
					
					// if there is no bestTimeObj stored, store it
					if(storedBestTimeObj == undefined) {
						localStorage.setItem('bestTimeObj', JSON.stringify(this.timerObj));
					}
					// if there is a bestTimerObJ stored, only store a new object if the current timer is smaller than the stored one
					else if(app.utilities.timeToSeconds(this.timerObj) < app.utilities.timeToSeconds(storedBestTimeObj)) {
						this.bestTimeObj = this.timerObj;
						localStorage.setItem('bestTimeObj', JSON.stringify(this.bestTimeObj));
					}
					
					// also store the current time of this run
					localStorage.setItem('currTimeObj', JSON.stringify(this.timerObj));
					
					// remove any eventListeners from the game since the gameScreen's eventListeners are separate from the screen master's (aka traps.js) eventListeners
					this.removeEventListeners();
				}
			}
			// if there is only 1 trap left, we have lost this level
			else if(this.traps.length == 1) {
				this.gameState = this.GAME_STATE_LEVEL_END;
				/*
				 * SCORE IS OUTDATED
				this.score = this.prevScore;
				*/
				this.lostLevel = true;
			}
			// if there are still traps left, continue the current level by going back to SETUP
			else {
				this.gameState = this.GAME_STATE_SETUP;
				this.numSteps = 0;
				for(var i = 0; i < this.traps.length; i++) {
					// reset all traps to inactive
					this.traps[i].active = false;
					// reset diamond traps' collideObjects
					if(this.traps[i].type == "diamond") {
						this.traps[i].collideObjects.up = undefined;
						this.traps[i].collideObjects.down = undefined;
						this.traps[i].collideObjects.right = undefined;
						this.traps[i].collideObjects.left = undefined;
					}
				}
			}
		}
		
		// if we're demolishing, check for collisions between traps and destroy them
		if(this.gameState == this.GAME_STATE_DEMOLISHING) {
			this.checkForCollisions();
			for(var i = 0; i < this.pulses.length; i++) this.pulses[i].update();
			// remove any pulses that should be removed
			this.pulses = this.pulses.filter(function(pulse) {
				return !pulse.remove;
			});
			this.explodeTraps(dt);
		}
		
		// draw everything
		this.draw();
	},
	
	// reset a level
	levelReset: function() {
		this.trapLifetime = 0;
		this.lostLevel = false;
		this.pulses = [];
		// remake the traps and the grid
		this.traps = this.makeTraps();
		this.makeGrid();
		createjs.Sound.play("newlevel");
	},
	
	// make a new game
	gameReset: function() {
		this.gameState = this.GAME_STATE_BEGIN;
		this.currentLevel = 0;
		/*
		 * SCORE IS OUTDATED
		this.score = 0;
		*/
		this.timer = 0;
		/*
		 * SCORE IS OUTDATED
		// check for highest scores
		if(localStorage.getItem('highScore') != undefined) {
			this.highScore = localStorage.getItem('highScore');
		}
		*/
		if(localStorage.getItem('bestTimeObj') != undefined) {
			this.bestTimeObj = JSON.parse(localStorage.getItem('bestTimeObj'));
		}
		// since gameScreen has it's own eventListeners, add them when the gameScreen starts
		this.addEventListeners();
	},
	
	// sets up the array of traps
	makeTraps: function() {
		var array = [];
		// create a temp variable of the current level
		var currLevel = app.levels[this.currentLevel];
		var xStart = 0;			// The x position of where the trap will start
		var xShift = 0;			// The x amount to move the trap if there are multiples of the same kind of trap
		var yStart = 0;			// The y position of where the trap will start
		var posIndex = 0;		// The index for inventoryPositions[]
		var diamondIndex = 0;	// The index position for currLevel.diamondDirections[]
		var tearIndex = 0;		// The index position for currLevel.tearDirections[]
		// set up all traps
		for(var i = 0; i < currLevel.traps.length; i++) {
			// if we're changing the kind of trap
			if(currLevel.traps[i] == "change") {
				// increment diamondIndex if the previous trap was a diamond, and then continue
				if(currLevel.traps[i-1] == "diamond") diamondIndex++;
				// increment tearIndex if the previous trap was a tear, and then continue
				if(currLevel.traps[i-1] == "tear") tearIndex++;
				continue;
			}
			// only check if this is not the first element in the array
			// put all traps of the same type on top of each other in the inventory
			// otherwise, put the trap in the next location in the array
			if(i > 0 && currLevel.traps[i-1] != currLevel.traps[i]) {
				posIndex++;
				xShift = 0;
			}
			
			// if it's not the first trap in the inventory of its kind, move the trap's inventory position
			// over to the right slightly
			if(i > 0 && currLevel.traps[i-1] == currLevel.traps[i]) {
				xShift += 25;
			}
			
			xStart = this.inventoryPositions[posIndex].x + xShift;
			yStart = this.inventoryPositions[posIndex].y;
			
			// add the traps depending on the type
			if(currLevel.traps[i] == "circle")
				array.push(new app.CircleTrap(xStart,yStart));
			else if(currLevel.traps[i] == "diamond") {
				// DiamondTrap(x, y, up, down, left, right, hudHeight, divisorLinePos)
				array.push(new app.DiamondTrap(xStart,yStart, 
												currLevel.diamondDirections[diamondIndex].up,
												currLevel.diamondDirections[diamondIndex].down,
												currLevel.diamondDirections[diamondIndex].left,
												currLevel.diamondDirections[diamondIndex].right,
												this.HUD_HEIGHT,
												this.DIVISOR_LINE_POS
												));
			}
			else if(currLevel.traps[i] == "tear") {
				array.push(new app.TearTrap(xStart, yStart, currLevel.tearDirections[tearIndex]));
			}
		}
		
		return array;
	},
	
	// sets up the grid
	makeGrid: function() {
		var i, j;
		
		// empty the array
		this.grid = [];
		
		// instantiate the grid array
		this.grid = new Array(this.numRows);
		// make the grid array into a two dimensional array
		for(i = 0; i < this.numRows; i++) {
			this.grid[i] = new Array(this.numCols);
		}
		
		// create the array
		for(i = 0; i < this.numRows; i++) {
			var centerX;
			var centerY;
			// evenly space the y position for the centers of the cells offsetting by half the GRID_CELL_SIZE
			centerY = this.HUD_HEIGHT + this.GRID_CELL_SIZE/2 + (this.GRID_CELL_SIZE * i);
			for(j = 0; j < this.numCols; j++) {
				// evenly space the x position for the centers of the cells offsetting by half the GRID_CELL_SIZE
				centerX = this.DIVISOR_LINE_POS + this.GRID_CELL_SIZE/2 + (this.GRID_CELL_SIZE * j);
				// add a new cell to the grid
				this.grid[i][j] = new app.Cell(this.GRID_CELL_SIZE, centerX, centerY);
			}
		}
		
		// used for resetting the grid
		// if there are any traps on the grid keep them
		if(this.traps.length > 0) {
			for(i = 0; i < this.traps.length; i++) {
				if(this.traps[i].rowIndex > -1 && this.traps[i].colIndex > -1) {
					this.grid[this.traps[i].rowIndex][this.traps[i].colIndex].obj = this.traps[i];
				}
			}
		}
	},
	
	draw: function() {
		this.drawHUD();
		// only draw the grid in GAME_STATE_SETUP
		if(this.gameState == this.GAME_STATE_SETUP) this.drawGrid();
		// don't draw sprites if it's the beginning of the game
		if(this.gameState != this.GAME_STATE_BEGIN) this.drawSprites();
	},
	
	drawHUD: function() {
		// ask if the player wants to start
		// this is a special view so if we're in this state, only draw this view
		if(this.gameState == this.GAME_STATE_BEGIN) {
				this.ctx.save();
				this.ctx.globalAlpha = 1.0;
				this.ctx.textAlign = "center";
				this.ctx.textBaseline = "middle";
				app.draw.text(this.ctx, "Click to Start", app.WIDTH/2, app.HEIGHT/2, 60, "green");
				
				this.ctx.restore();
		}
		else {
			// changed the background color whenever in Demolition
			if(this.gameState == this.GAME_STATE_DEMOLISHING || this.gameState == this.GAME_STATE_DEMOLITION || this.gameState == this.GAME_STATE_DEMOLITION_DONE) {
				app.draw.rect(this.ctx, 0, 0, app.WIDTH, app.HEIGHT, "#400", "white");
				// color the inventory a slightly lighter red
				app.draw.rect(this.ctx, 0, 0, this.DIVISOR_LINE_POS, app.HEIGHT, "#600", "white");
			}
			// color the inventory a slightly lighter black (aka dark gray)
			else {
				app.draw.rect(this.ctx, 0, 0, this.DIVISOR_LINE_POS, app.HEIGHT, "#1F1F1F", "white");
			}
			// tell the player when they completed a level and that they can click to continue
			if(this.gameState == this.GAME_STATE_LEVEL_END) {
				this.ctx.save();
				this.ctx.globalAlpha = 1.0;
				this.ctx.textAlign = "center";
				this.ctx.textBaseline = "middle";
				// check if we lost the level or not
				if(this.lostLevel) {
					app.draw.text(this.ctx, "Level Incomplete", app.WIDTH/2, app.HEIGHT/2, 60, "red");
					app.draw.text(this.ctx, "Click to Retry", app.WIDTH/2, app.HEIGHT/2 + 75, 40, "green");
				}
				else {
					app.draw.text(this.ctx, "Level Complete", app.WIDTH/2, app.HEIGHT/2, 60, "blue");
					app.draw.text(this.ctx, "Click to Continue", app.WIDTH/2, app.HEIGHT/2 + 75, 40, "green");
				}
				this.ctx.restore();
				this.ctx.globalAlpha = 0.25;
			}
			else {
				this.ctx.globalAlpha = 1.0;
			}
			
			// draw the line that divides the inventory and the playing screen
			app.draw.rect(this.ctx, this.DIVISOR_LINE_POS, 0, 3, app.HEIGHT, "#fff");
			// draw the HUD line
			// add 3 to HUD_HEIGHT to account for the size of the line
			app.draw.rect(this.ctx, 0, this.HUD_HEIGHT + 3, app.WIDTH, 3, "#fff");
			
			// TEXT
			// the word, 'Traps' at the top of the inventory
			app.draw.text(this.ctx, "TRAPS", 20, 50, 40, "white");
			// current level
			app.draw.text(this.ctx, "Level " + (this.currentLevel + 1), this.DIVISOR_LINE_POS + 20, 30, 20, "white"); 
			// current game stage
			if(this.gameState == this.GAME_STATE_BEGIN || this.gameState == this.GAME_STATE_SETUP)
				app.draw.text(this.ctx, "Setup Stage", this.DIVISOR_LINE_POS + 20, 60, 20, "white");
			else
				app.draw.text(this.ctx, "Demolition Stage", this.DIVISOR_LINE_POS + 20, 60, 20, "white");
			// timer
			app.draw.timer(this.ctx, this.timerObj, 5*app.WIDTH/8, 30, 20, "white");
			/*
			 * SCORE IS OUTDATED
			// current score
			app.draw.text(this.ctx, "Score: " + this.score, app.WIDTH - 240, 30, 20, "white");
			// high score
			app.draw.text(this.ctx, "High Score: " + this.highScore, app.WIDTH - 240, 60, 20, "white");
			*/
		}
	},
	
	drawSprites: function() {
		// draw all of the traps
		for(var i = 0; i < this.traps.length; i++) {
			this.traps[i].draw(this.ctx);
		}
		// if we're in DEMOLISHING mode draw the activated states of the traps as well as any exploding pulses
		if(this.gameState == this.GAME_STATE_DEMOLISHING) {
			for(var i = 0; i < this.traps.length; i++) {
				this.traps[i].drawWhenActive(this.ctx);
			}
			for(var i = 0; i < this.pulses.length; i++) {
				this.pulses[i].draw(this.ctx);
			}
		}
	},
	
	// draw the grid
	drawGrid: function() {
		for(var i = 0; i < this.numRows; i++) {
			for(var j = 0; j < this.numCols; j++) {
				this.grid[i][j].draw(this.ctx);
			}
		}
	},
	
	// explode traps and check for scores
	explodeTraps: function(dt){
		var tempTrap;				// a copy of a trap
		var firePulse;				// will be 0 when it is time to fire another pulse
		var numTraps;				// the current number of traps
		var numTrapsDestroyed;		// the number of traps that are destroyed
		
		this.trapLifetime++;
		// if we've reached the lifetimes of exploding traps
		// update the traps array, calculate the score, and reset things
		if(this.trapLifetime > this.TRAP_EXPLODE_LIFETIME) {
			this.gameState = this.GAME_STATE_DEMOLITION_DONE;
			// get the current number of traps
			numTraps = this.traps.length;
			// filter the traps array
			this.traps = this.traps.filter(function(trap) {
				return !trap.die;
			});
			
			/*
			 * SCORE IS OUTDATED
			// get the number of traps that have been destroyed
			numTrapsDestroyed = numTraps - this.traps.length;
			
			// add one to the chain multiplier for each trap past 2 traps
			if(numTrapsDestroyed > 2) this.chainMultiplier += numTrapsDestroyed - 2;
			// calculate the score
			this.score += this.DEFAULT_TRAP_VALUE * numTrapsDestroyed * this.chainMultiplier;
			// reset the chainMultiplier for the next scoring round
			this.chainMultiplier = 1;
			*/
			
			// reset lifetime
			this.trapLifetime = 0;
			// reset pulses
			this.pulses = [];
			// remake the grid to remove any now undefined traps
			this.makeGrid();
			
			// only play an explosion sound if something has exploded
			// aka if the traps array has changed in length
			if(this.traps.length != numTraps) createjs.Sound.play("explosion");
		}
		else {
			firePulse = this.trapLifetime % this.TRAP_PULSE_LIFETIME;
			// every so often add a new pulse to any exploding object
			if(firePulse == 0) {
				for(var i = 0; i < this.traps.length; i++) {
					if(this.traps[i].die) {
						tempTrap = this.traps[i];
						this.pulses.push(new app.Pulse(tempTrap.x, tempTrap.y, tempTrap.r));
					}
				} // end for
			} // end if firePulse
		} // end if trapLifetime
	},
	
	// check for any collisions between traps by checking the trap type and any possible hits in the grid
	checkForCollisions: function() {
		var i, j;
		var currTrap;	// a copy of the trap we are checking
		var row, col;	// the rowIndex and colIndex of the current trap
		
		for(i = 0; i < this.traps.length; i++) {
			currTrap = this.traps[i];
			if(currTrap.active) {
				row = currTrap.rowIndex;
				col = currTrap.colIndex;
				// handle checking for circles
				// Circles hit traps in the cells above, below, to the left, and to the right
				if(currTrap.type == "circle") {
					// check trap above if possible
					if(row > 0 && this.grid[row - 1][col].obj != undefined) {
						this.grid[row - 1][col].obj.active = true;
						this.grid[row - 1][col].obj.die = true;
					}
					// check trap below if possible
					if(row < this.numRows - 1 && this.grid[row + 1][col].obj != undefined) {
						this.grid[row + 1][col].obj.active = true;
						this.grid[row + 1][col].obj.die = true;
					}
					// check trap to the left if possible
					if(col > 0 && this.grid[row][col - 1].obj != undefined) {
						this.grid[row][col-1].obj.active = true;
						this.grid[row][col-1].obj.die = true;
					}
					// check trap to the right if possible
					if(col < this.numCols - 1 && this.grid[row][col + 1].obj != undefined) {
						this.grid[row][col + 1].obj.active = true;
						this.grid[row][col + 1].obj.die = true;
					}
				} // end check for circles
				// Diamonds hit the first trap in the row or column in the direction that they can fire
				if(currTrap.type == "diamond") {
					// check for any traps above
					if(row > 0 && currTrap.up) {
						// loop backwards to check for the closest trap above if any
						for(j = row - 1; j >= 0; j--) {
							if(this.grid[j][col].obj != undefined) {
								this.grid[j][col].obj.active = true;
								this.grid[j][col].obj.die = true;
								this.traps[i].collideObjects.up = this.grid[j][col].obj;
								// break because we only want the closest trap
								break;
							}
						}
					} // end check traps above
					// check for any traps below
					if(row < this.numRows - 1 && currTrap.down) {
						// start at the next row
						for(j = row + 1; j < this.numRows; j++) {
							if(this.grid[j][col].obj != undefined) {
								this.grid[j][col].obj.active = true;
								this.grid[j][col].obj.die = true;
								this.traps[i].collideObjects.down = this.grid[j][col].obj;
								// break because we only want the closest trap
								break;
							}
						}
					} // end check traps below
					// check for any traps to the left
					if(col > 0 && currTrap.left) {
						// loop backwards to check for the closest trap to the left if any
						for(j = col - 1; j >= 0; j--) {
							if(this.grid[row][j].obj != undefined) {
								this.grid[row][j].obj.active = true;
								this.grid[row][j].obj.die = true;
								this.traps[i].collideObjects.left = this.grid[row][j].obj;
								// break because we only want the closest trap
								break;
							}
						}
					} // end check traps to the left
					// check for any traps to the right
					if(col < this.numCols - 1 && currTrap.right) {
						// loop backwards to check for the closest trap to the left if any
						for(j = col + 1; j < this.numCols; j++) {
							if(this.grid[row][j].obj != undefined) {
								this.grid[row][j].obj.active = true;
								this.grid[row][j].obj.die = true;
								this.traps[i].collideObjects.right = this.grid[row][j].obj;
								// break because we only want the closest trap
								break;
							}
						}
					} // end check traps to the left
				} // end check for diamonds
				// Tears destroy the trap exactly 2 cells away in the direction it faces
				if(currTrap.type == "tear") {
					// if the target would be out of bounds, draw the trap off the scene
					this.traps[i].activeObj = {x: 10000, y:10000};
					// check for a trap two cells up
					if(row > 1 && currTrap.direction == "up") {
						if(this.grid[row - 2][col].obj != undefined) {
							this.grid[row - 2][col].obj.active = true;
							this.grid[row - 2][col].obj.die = true;
							this.traps[i].activeObj = this.grid[row - 2][col].obj;
						}
						// if there is nothing there add the correct position so that the trap still draws
						else {
							this.traps[i].activeObj = {x: this.grid[row - 2][col].center.x, y: this.grid[row - 2][col].center.y};
						}
					} // end if two cells up
					// check for a trap two cells down
					if(row < this.numRows - 2 && currTrap.direction == "down") {
						if(this.grid[row + 2][col].obj != undefined) {
							this.grid[row + 2][col].obj.active = true;
							this.grid[row + 2][col].obj.die = true;
							this.traps[i].activeObj = this.grid[row + 2][col].obj;
						}
						// if there is nothing there add the correct position so that the trap still draws
						else {
							this.traps[i].activeObj = {x: this.grid[row + 2][col].center.x, y: this.grid[row + 2][col].center.y};
						}
					} // end if two cells down
					// check for a trap two cells to the left
					if(col > 1 && currTrap.direction == "left") {
						if(this.grid[row][col - 2].obj != undefined) {
							this.grid[row][col - 2].obj.active = true;
							this.grid[row][col - 2].obj.die = true;
							this.traps[i].activeObj = this.grid[row][col - 2].obj;
						}
						// if there is nothing there add the correct position so that the trap still draws
						else {
							this.traps[i].activeObj = {x: this.grid[row][col - 2].center.x, y: this.grid[row][col - 2].center.y};
						}
					} // end if two cells left
					// check for a trap two cells to the right
					if(col < this.numCols - 2 && currTrap.direction == "right") {
						if(this.grid[row][col + 2].obj != undefined) {
							this.grid[row][col + 2].obj.active = true;
							this.grid[row][col + 2].obj.die = true;
							this.traps[i].activeObj = this.grid[row][col + 2].obj;
						}
						// if there is nothing there add the correct position so that the trap still draws
						else {
							this.traps[i].activeObj = {x: this.grid[row][col + 2].center.x, y: this.grid[row][col + 2].center.y};
						}
					} // end if two cells right
				} // end check for tear
			} // end check if traps are active
		} // end for
	},
	
	// return a collision between 2 circles
	circToCircCollides: function(a, b) {
		 var distance_squared =  (  (( a.x - b.x )  *  (a.x - b.x))  +  
									((a.y - b.y)  *  (a.y - b.y)) ) ;

        var radii_squared =  ( a . r + b . r )  *  ( a . r + b . r ) ;

        return (distance_squared < radii_squared);
	},
	
	// mouse events
	doMousedown: function(e) {
		var i, j, k;
		e.preventDefault();
		var highestIndex = -1; 	// used to make sure we grab the item on top if things are stacked
		
		// get the mouse position
		this.mouse = app.utilities.getMouse(e);
		
		// if we start a new level, make the level
		if(this.gameState == this.GAME_STATE_BEGIN || this.gameState == this.GAME_STATE_LEVEL_END) {
			this.gameState = this.GAME_STATE_SETUP;
			this.levelReset();
		}
		
		// check if we can pick something up, but only during SETUP and DEMOLITION when such a thing is allowed
		if(this.gameState == this.GAME_STATE_SETUP || this.gameState == this.GAME_STATE_DEMOLITION) {
			for(i = 0; i < this.traps.length; i++) {
				// check if we clicked something clickable
				if(app.utilities.pointInCirc(this.mouse, this.traps[i])) {
					// only apply drag if the in GAME_STATE_SETUP
					if(this.gameState == this.GAME_STATE_SETUP) {
						this.dragging = true;
						// if there is a stack of multiple things, grab the one on top
						if (i > highestIndex) {
							// if the object is somewhere on the grid set the cell's object to undefined
							if(this.traps[i].rowIndex > -1 && this.traps[i].colIndex > -1) {
								this.grid[this.traps[i].rowIndex][this.traps[i].colIndex].obj = undefined;
							}
							// retain the object's previous starting location
							this.traps[i].prevX = this.traps[i].x;
							this.traps[i].prevY = this.traps[i].y;
							// grab the object by using the point on the object that was clicked as the anchor point
							// also set the current dragPos to the anchor point in case we never get to doMousemove
							// otherwise dragPos will be undefined
							this.dragHoldX = this.dragPosX = this.mouse.x - this.traps[i].x;
							this.dragHoldY = this.dragPosY = this.mouse.y - this.traps[i].y;
							// update the highestIndex to the current object
							highestIndex = i;
							// save the index of the current trap we are dragging
							this.dragIndex = i;
						} // end if i > highestIndex
						
					} // end if gameState == this.GAME_STATE_SETUP
					
					// a player only has one click if in GAME_STATE_DEMOLITION
					if(this.traps[i].x > this.DIVISOR_LINE_POS && this.gameState == this.GAME_STATE_DEMOLITION) {
						this.gameState = this.GAME_STATE_DEMOLISHING;
						// activate the trap that was clicked on
						this.traps[i].active = true;
						createjs.Sound.play("activate");
					} // end if gameState == this.GAME_STATE_DEMOLITION
				} // end if pointInCirc
			} // end for
		} // end if GAME_STATE_SETUP || GAME_STATE_DEMOLITION
	},
	
	doMouseup: function(e) {
		e.preventDefault();
		// only check mouse up if we were dragging and the we are in GAME_STATE_SETUP
		if (this.dragging && this.gameState == this.GAME_STATE_SETUP) {
			// we are no longer dragging
			this.dragging = false;
			// snap the trap back to the correct inventory slot
			// reset the traps grid indices to -1, which indicates the inventory
			if(this.dragPosX < this.DIVISOR_LINE_POS) {
				this.dragPosX = this.traps[this.dragIndex].xInvLoc;
				this.dragPosY = this.traps[this.dragIndex].yInvLoc;
				 this.traps[this.dragIndex].rowIndex = -1;
				 this.traps[this.dragIndex].colIndex = -1;
			}
			// if the trap is on the playing field, check it against the cells in the grid
			else if(this.dragPosX > this.DIVISOR_LINE_POS) {
				var currentCol;
				var currentRow;
				
				// get the column that the trap is in
				for(var j = 0; j < this.numCols; j++) {
					var leftBound;
					var rightBound;
					leftBound = this.DIVISOR_LINE_POS + this.GRID_CELL_SIZE * j;
					rightBound = this.DIVISOR_LINE_POS + this.GRID_CELL_SIZE * (j+1);
					if(this.dragPosX >= leftBound && this.dragPosX < rightBound) {
						currentCol = j;
						break;
					}
				}
				
				// get the row that the trap is in
				for(var i = 0; i < this.numRows; i++) {
					var lowerBound;
					var upperBound;
					lowerBound = this.HUD_HEIGHT + this.GRID_CELL_SIZE * i;
					upperBound = this.HUD_HEIGHT + this.GRID_CELL_SIZE * (i+1);
					if(this.dragPosY >= lowerBound && this.dragPosY < upperBound) {
						currentRow = i;
						break;
					}
				} // end for numRows
					
				// if there is no object in that position of the grid, add the trap to that location
				// also set the grid variables of the trap to that location's indices
				if(this.grid[currentRow][currentCol].obj === undefined) {
					this.dragPosX = this.grid[currentRow][currentCol].center.x;
					this.dragPosY = this.grid[currentRow][currentCol].center.y;
					this.traps[this.dragIndex].rowIndex = currentRow;
					this.traps[this.dragIndex].colIndex = currentCol;
					this.grid[currentRow][currentCol].obj = this.traps[this.dragIndex];
				}
				// if there is an object in that position of the grid, place the trap back where it previously was
				else {
					this.dragPosX = this.traps[this.dragIndex].prevX;
					this.dragPosY = this.traps[this.dragIndex].prevY;
					if(this.traps[this.dragIndex].rowIndex > -1 && this.traps[this.dragIndex].colIndex > -1)
						this.grid[this.traps[this.dragIndex].rowIndex][this.traps[this.dragIndex].colIndex].obj = this.traps[this.dragIndex];
				}
				
				createjs.Sound.play("placeTrap");
			} // end if this.dragPosX > this.DIVISOR_LINE_POS
			
			// re-position the trap to account for any changes
			this.traps[this.dragIndex].x = this.dragPosX;
			this.traps[this.dragIndex].y = this.dragPosY;
			
			
		} // end if GAME_STATE_SETUP
	},
	
	doMousemove: function(e) {
		e.preventDefault();
		// if we are currently dragging and in GAME_STATE_SETUP
		if(this.dragging && this.gameState == this.GAME_STATE_SETUP) {
			this.rad = this.traps[this.dragIndex].r;
			
			this.mouse = app.utilities.getMouse(e);
			
			// the current positions of the dragged object
			this.dragPosX = this.mouse.x - this.dragHoldX;
			this.dragPosY = this.mouse.y - this.dragHoldY;
			
			// clamp posX and posY so we can't drag it off canvas
			this.dragPosX = app.utilities.clamp(this.dragPosX, this.rad, app.WIDTH - this.rad);
			this.dragPosY = app.utilities.clamp(this.dragPosY, this.HUD_HEIGHT + this.rad, app.HEIGHT - this.rad);
			
			// set the appropriate x and y of the trap
			this.traps[this.dragIndex].x = this.dragPosX;
			this.traps[this.dragIndex].y = this.dragPosY;
		}
	},
	
	// adding and removing eventListeners
	addEventListeners: function() {
		this.canvas.addEventListener("mousedown", this.mouseDownBind);
		window.addEventListener("mousemove", this.mouseMoveBind);
		window.addEventListener("mouseup", this.mouseUpBind);
	},
	
	removeEventListeners: function() {
		this.canvas.removeEventListener("mousedown", this.mouseDownBind);
		window.removeEventListener("mousemove", this.mouseMoveBind);
		window.removeEventListener("mouseup", this.mouseUpBind);
	}
};