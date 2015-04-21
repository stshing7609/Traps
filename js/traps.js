/*
	Name: traps.js
	Author: Steven Shing
	Notes: Search '~' for debug comments and notes for things to change
*/
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.traps = {
	// CONSTANTS
	// Screen States
	SCREEN_STATE_TITLE: 0,
	SCREEN_STATE_INSTRUCTIONS: 1,
	SCREEN_STATE_GAME: 2,
	SCREEN_STATE_GAMEOVER: 3,
	SCREEN_STATE_HIGH_SCORES: 4,
	SCREEN_STATE_TRANSITION: 5,
	
	// Instruction Screen States
	// continue the count from the screen states for button purposes
	INSTRUCTION_PAGE_1: 6,
	INSTRUCTION_PAGE_2: 7,
	INSTRUCTION_PAGE_3: 8,
	INSTRUCTION_PAGE_4: 9,
	INSTRUCTION_PAGE_5: 10,
	INSTRUCTION_PAGE_6: 11,
	
	// Text sizes
	TITLE_TEXT_SIZE: 100,
	LARGE_TEXT_SIZE: 80,
	MEDIUM_TEXT_SIZE: 40,
	SMALL_TEXT_SIZE: 30,
	BUTTON_TEXT_SIZE: 20,
	INSTRUCTIONS_TEXT_SIZE: 20,
	
	// variable properties
	screenState: undefined,
	gameScreen:undefined,
	canvas: undefined,
	ctx:  undefined,
	dt: 1/60.0, // "delta time"
	
	// buttons
	addButtons: true,
	screenStateButtonTarget: -1,
	buttons: [],
	
	// instructions
	instructionsCurrPage: undefined,
	setupStageImage: undefined,
	demolitionStageImage: undefined,
	levelCompleteImage: undefined,
	secondSetupImage: undefined,
	levelIncompleteImage: undefined,
	
	// mouse stuff
	clicked: false,
	mouse: undefined,
	mouseDownBind: undefined,
	
	init : function() {
		this.canvas = document.querySelector('canvas');
		this.canvas.width = app.WIDTH;
		this.canvas.height = app.HEIGHT;

		this.ctx = this.canvas.getContext('2d');
		
		this.gameScreen = app.gameScreen;
		this.gameScreen.init(this.canvas, this.ctx);
		
		this.screenState = this.SCREEN_STATE_TITLE;
		this.instructionsCurrPage = this.INSTRUCTION_PAGE_1;
		
		// load images
		var image = new Image();
		image.src = app.IMAGES['setupStageImage'];
		this.setupStageImage = image;
		
		image = new Image();
		image.src = app.IMAGES['demolitionStageImage'];
		this.demolitionStageImage = image;
		
		image = new Image();
		image.src = app.IMAGES['levelCompleteImage'];
		this.levelCompleteImage = image;
		
		image = new Image();
		image.src = app.IMAGES['secondSetupImage'];
		this.secondSetupImage = image;
		
		image = new Image();
		image.src = app.IMAGES['levelIncompleteImage'];
		this.levelIncompleteImage = image;
		
		// keep track of any eventListener binds
		this.mouseDownBind = this.doMousedown.bind(this);
		
		this.canvas.addEventListener("mousedown", this.mouseDownBind);
		
		this.update();
	},   	
	
	
    update: function(){
    	// clear screen
    	app.draw.clear(this.ctx,0,0,app.WIDTH,app.HEIGHT);
		// PAUSED?
		if (app.paused){
			this.drawPauseScreen(this.ctx);
			return;
		 }
		
		// DRAW
		app.draw.rect(this.ctx, 0, 0, app.WIDTH, app.HEIGHT, "black", "white");
		
		// check if we're transiting between states
		if(this.screenState == this.SCREEN_STATE_TRANSITION) {
			// if it's SCREEN_STATE_GAME, remove the mousedown event because gameScreen has it's own mousedown
			// reset the game
			if(this.screenStateButtonTarget == this.SCREEN_STATE_GAME) {
				this.canvas.removeEventListener("mousedown", this.mouseDownBind);
				// start a game soundtrack
				this.startSoundtrack();
				// start a new game
				this.gameScreen.gameReset();
			}
			// transist to the target state
			this.screenState = this.screenStateButtonTarget;
			// reset the instructions page
			this.instructionsCurrPage = this.INSTRUCTION_PAGE_1;
			// remove all buttons
			this.buttons = [];
			// the next time buttons are needed, they can be added to the array
			this.addButtons = true;
		}
		
		// draw the title screen
		if(this.screenState == this.SCREEN_STATE_TITLE) {
			this.drawTitleScreen(this.ctx);
		}
		
		// draw the instructions screen
		if(this.screenState == this.SCREEN_STATE_INSTRUCTIONS) {
			this.drawInstructionsScreen(this.ctx);
		}
		
		// draw the gameover screen
		if(this.screenState == this.SCREEN_STATE_GAMEOVER) {
			this.drawGameoverScreen(this.ctx);
		}
		
		// draw the game screen
		if(this.screenState == this.SCREEN_STATE_GAME) {
			this.gameScreen.update(this.dt);
			if(this.gameScreen.gameState == this.gameScreen.GAME_STATE_END) {
				// if the game ended, add the mousedown event listener since it is separate from gameScreen's mousedown
				this.canvas.addEventListener("mousedown", this.mouseDownBind);
				// change the state to GAMEOVER
				this.screenState = this.SCREEN_STATE_GAMEOVER;
				// start the title background
				this.startBackground();
				// make if possible to add buttons if necessary
				this.addButtons = true;
			}
		}
		
		if(this.screenState == this.SCREEN_STATE_HIGH_SCORES) {
			this.drawHighscoreScreen(this.ctx);
		}
		
		// draw any buttons
		for(var i = 0; i < this.buttons.length; i++) this.buttons[i].draw(this.ctx);
		
		// LOOP
		app.animationID = requestAnimationFrame(this.update.bind(this));
	},
	
	drawTitleScreen: function(ctx) {
		// draw the title, "TRAPS", and credit me
		ctx.save();
		ctx.globalAlpha = 1.0;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = -7;
		ctx.shadowOffsetY = 7;
		ctx.shadowColor = "#888";
		app.draw.text(this.ctx, "TRAPS", app.WIDTH/2, 250, this.TITLE_TEXT_SIZE, "white");
		ctx.shadowColor = "#659D32";
		app.draw.text(this.ctx, "By Steven Shing", app.WIDTH/2, 320, this.SMALL_TEXT_SIZE, "green");
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.restore();
		// add buttons to the buttons array
		if(this.addButtons) {
			// Button(x, y, width, height, text, textSize, screenTarget)
			this.buttons.push(new app.Button(app.WIDTH/2, 450, 180, 40, "Play", this.BUTTON_TEXT_SIZE, this.SCREEN_STATE_GAME));
			this.buttons.push(new app.Button(app.WIDTH/2, 520, 180, 40, "Instructions", this.BUTTON_TEXT_SIZE, this.SCREEN_STATE_INSTRUCTIONS));
			this.buttons.push(new app.Button(app.WIDTH/2, 590, 180, 40, "High Scores", this.BUTTON_TEXT_SIZE, this.SCREEN_STATE_HIGH_SCORES));
			this.addButtons = false;
		}
	},
	
	drawInstructionsScreen: function(ctx) {
		// draw every instruction screen
		var startY;						// the start y position of the text
		var textDistance = 30;			// the distance between text within a text block
		var textBlockDistance = 50;		// the distance between text blocks
		
		ctx.save();
		ctx.globalAlpha = 1.0;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		app.draw.text(ctx, "Instructions", app.WIDTH/2, 80, this.TITLE_TEXT_SIZE, "white");
		// General instructions
		if(this.instructionsCurrPage == this.INSTRUCTION_PAGE_1) {
			startY = 200;
			app.draw.text(ctx, "Each level you will be given a set of traps.", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "You must use these traps to destroy each other to complete a level.", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			startY = startY + textDistance + textBlockDistance;
			app.draw.text(ctx, "Below are some examples of traps you might see:", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			startY = 350;
			var sampleCircleTrap = new app.CircleTrap(app.WIDTH/2 - 180, startY);
			var sampleDiamondTrap = new app.DiamondTrap(app.WIDTH/2, startY, true, true, false, true);
			var sampleTearTrap = new app.TearTrap(app.WIDTH/2 + 180, startY, "up");
			sampleCircleTrap.draw(ctx);
			sampleDiamondTrap.draw(ctx);
			sampleTearTrap.draw(ctx);
			startY = 450;
			app.draw.text(ctx, "You win the game when you complete every level.", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "Complete each level as fast as possible!", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			//app.draw.text(ctx, "Try to get the highest score too!", app.WIDTH/2, 520, this.INSTRUCTIONS_TEXT_SIZE, "white");
		}
		// Show the players the different stages
		else if(this.instructionsCurrPage == this.INSTRUCTION_PAGE_2) {
			app.draw.text(ctx, "The game consists of two different kinds of stages:", app.WIDTH/2, 200, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			app.draw.text(ctx, "Setup Stage", 110 + 350/2, 270, this.INSTRUCTIONS_TEXT_SIZE, "white");
			ctx.drawImage(this.setupStageImage, 110, 300, 350, 280);
			
			app.draw.text(ctx, "Demolition Stage", app.WIDTH - 110 - 350/2, 270, this.INSTRUCTIONS_TEXT_SIZE, "white");
			ctx.drawImage(this.demolitionStageImage, app.WIDTH - 110, 300, -350, 280);
		}
		// Explain the setup stage
		else if(this.instructionsCurrPage == this.INSTRUCTION_PAGE_3) {
			app.draw.text(ctx, "Setup Stage", 110 + 350/2, 270, this.INSTRUCTIONS_TEXT_SIZE, "white");
			ctx.drawImage(this.setupStageImage, 110, 300, 350, 280);
			
			startY = 275;
			
			// draw all the text where the demolition stage image was
			app.draw.text(ctx, "During the Setup Stage, you can", app.WIDTH - 110 - 350/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "drag traps from your inventory onto", app.WIDTH - 110 - 350/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "the grid in the playing field and", app.WIDTH - 110 - 350/2, startY + textDistance*2, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "arrange them however you like", app.WIDTH - 110 - 350/2, startY + textDistance*3, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "by using the mouse.", app.WIDTH - 110 - 350/2, startY + textDistance*4, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "Traps will snap to the grid.", app.WIDTH - 110 - 350/2, startY + textDistance*5, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "You can also drag traps from the", app.WIDTH - 110 - 350/2, startY + textDistance*6, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "grid back to your inventory.", app.WIDTH - 110 - 350/2, startY + textDistance*7, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textDistance*7 + textBlockDistance;
			
			app.draw.text(ctx, "When you have finished setting",app.WIDTH - 110 - 350/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "your traps, press 'SPACE' to move",app.WIDTH - 110 - 350/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "to the Demolition Stage.",app.WIDTH - 110 - 350/2, startY + textDistance*2, this.INSTRUCTIONS_TEXT_SIZE, "white");
		}
		// Explain the demolition stage
		else if(this.instructionsCurrPage == this.INSTRUCTION_PAGE_4) {
			app.draw.text(ctx, "Demolition Stage", app.WIDTH - 110 - 350/2, 270, this.INSTRUCTIONS_TEXT_SIZE, "white");
			ctx.drawImage(this.demolitionStageImage, app.WIDTH - 110, 300, -350, 280);
			
			startY = 180;
			
			// draw all the text where the setup stage image was
			app.draw.text(ctx, "During the Demolition Stage, you can click", 110 + 350/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "on ONLY one trap you set in the playing", 110 + 350/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "field to supply energy to it. This", 110 + 350/2, startY + textDistance*2, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "will activate the trap, but will", 110 + 350/2, startY + textDistance*3, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "NOT destroy it.", 110 + 350/2, startY + textDistance*4, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textDistance*4 + textBlockDistance;
			
			app.draw.text(ctx, "If the trap hits any other traps, ", 110 + 350/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "those other traps are supplied", 110 + 350/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "with energy so they activate.", 110 + 350/2, startY + textDistance*2, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "However, this supplies them", 110 + 350/2, startY + textDistance*3, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "with too much energy so", 110 + 350/2, startY + textDistance*4, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "after a short while those traps", 110 + 350/2, startY + textDistance*5, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "are destroyed.", 110 + 350/2, startY + textDistance*6, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textDistance*6 + textBlockDistance;
			
			app.draw.text(ctx, "Remember, you have to hit the trap", 110 + 350/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "you activate with another trap to", 110 + 350/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "destroy it.", 110 + 350/2, startY + textDistance*2, this.INSTRUCTIONS_TEXT_SIZE, "white");
		}
		// Explain the results of the demolition stage
		else if(this.instructionsCurrPage == this.INSTRUCTION_PAGE_5) {
			startY = 200;
			
			app.draw.text(ctx, "When you finish the Demolition Stage, if you have destroyed", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "every trap you have completed the level.", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textDistance + textBlockDistance;
			
			app.draw.text(ctx, "If any traps are left over, you will automatically be", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "brought back to the Setup Stage.", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textDistance + textBlockDistance;
			
			app.draw.text(ctx, "If you have only one trap left, you lose that level.", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			// draw some images at the bottom
			app.draw.text(ctx, "Level Complete", 110 + 120, 440, this.INSTRUCTIONS_TEXT_SIZE, "blue");
			ctx.drawImage(this.levelCompleteImage, 110, 470, 240, 180);
			
			app.draw.text(ctx, "Another Setup", 110 + 260 + 120, 440, this.INSTRUCTIONS_TEXT_SIZE, "white");
			ctx.drawImage(this.secondSetupImage, 110 + 260, 470, 240, 180);
			
			app.draw.text(ctx, "Level Incomplete", 110 + 260*2 + 120, 440, this.INSTRUCTIONS_TEXT_SIZE, "red");
			ctx.drawImage(this.levelIncompleteImage, 110 + 260*2, 470, 240, 180);
		}
		// Give some tips
		else if(this.instructionsCurrPage == this.INSTRUCTION_PAGE_6) {
			app.draw.text(ctx, "TIPS:", app.WIDTH/2, 200, this.MEDIUM_TEXT_SIZE, "green");
		
			startY = 280;
			
			app.draw.text(ctx, "You'll have to experiment to find out how each trap works.", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "Some traps have different different forms.", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textDistance + textBlockDistance;
			
			app.draw.text(ctx, "You can press 'r' to restart the current level", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "However, this will not stop the timer!", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textDistance + textBlockDistance;
			
			app.draw.text(ctx, "You don't have to destroy every trap in one demolition,", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "you can destroy them in smaller groups!", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			/*
			 * SCORE IS OUTDATED
			startY = startY + textDistance + textBlockDistance;
			
			app.draw.text(ctx, "The more traps you destroy in one demolition, the more points you get!", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			
			startY = startY + textBlockDistance;
			
			app.draw.text(ctx, "Sometimes getting the best score means giving up", app.WIDTH/2, startY, this.INSTRUCTIONS_TEXT_SIZE, "white");
			app.draw.text(ctx, "time and vice-versa!", app.WIDTH/2, startY + textDistance, this.INSTRUCTIONS_TEXT_SIZE, "white");
			*/
		}
		ctx.restore();
		
		// always add instruction buttons as the target screens that buttons lead to change
		// empty the array to remake the buttons
		this.buttons = [];
		// add buttons to the buttons array
		// Button(x, y, width, height, text, textSize, screenTarget)
		// if we can go to the next page, make a button that allows us too
		if(this.instructionsCurrPage > this.INSTRUCTION_PAGE_1)
			this.buttons.push(new app.Button(60, app.HEIGHT/2, 40, 40, "<", this.BUTTON_TEXT_SIZE, this.instructionsCurrPage - 1));
		this.buttons.push(new app.Button(app.WIDTH/2, 700, 180, 40, "Back to Title", this.BUTTON_TEXT_SIZE, this.SCREEN_STATE_TITLE));
		// if we can go to a previous page, make a button that allows us too
		if(this.instructionsCurrPage < this.INSTRUCTION_PAGE_6)
			this.buttons.push(new app.Button(app.WIDTH - 60, app.HEIGHT/2, 40, 40, ">", this.BUTTON_TEXT_SIZE, this.instructionsCurrPage + 1));
	},
	
	drawHighscoreScreen: function(ctx) {
		// display the player's max scores
		/*
		 * SCORE IS OUTDATED
		var highScore = localStorage.getItem('highScore');
		*/
		var bestTimeObj = JSON.parse(localStorage.getItem('bestTimeObj'));
		ctx.save();
		ctx.globalAlpha = 1.0;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		/*
		 * SCORE IS OUTDATED
		app.draw.text(ctx, "High Scores", app.WIDTH/2, 80, this.LARGE_TEXT_SIZE, "white");
		*/
		
		app.draw.text(ctx, "Best Time:", app.WIDTH/2, 250, this.MEDIUM_TEXT_SIZE, "white");
		if(bestTimeObj != undefined) app.draw.timer(ctx, bestTimeObj, app.WIDTH/2, 300, this.SMALL_TEXT_SIZE, "green", true);
		else app.draw.text(ctx, "0s", app.WIDTH/2, 300, this.SMALL_TEXT_SIZE, "green", true);
		
		/*
		 * SCORE IS OUTDATED
		app.draw.text(ctx, "High Score:", app.WIDTH/2, 400, this.MEDIUM_TEXT_SIZE, "white");
		if(highScore != undefined) app.draw.text(ctx, highScore, app.WIDTH/2, 450, this.SMALL_TEXT_SIZE, "green");
		else app.draw.text(ctx, "0", app.WIDTH/2, 450, this.SMALL_TEXT_SIZE, "green");
		*/
		
		ctx.restore();
		// add buttons to the buttons array
		if(this.addButtons) {
			// Button(x, y, width, height, text, textSize, screenTarget)
			this.buttons.push(new app.Button(app.WIDTH/2, 700, 180, 40, "Back to Title", this.BUTTON_TEXT_SIZE, this.SCREEN_STATE_TITLE));
			this.addButtons = false;
		}
	},
	
	drawGameoverScreen: function(ctx) {
		// display that you won (since you can only win in this game)
		// display the player's max scores
		// display the time of the player's current run
		/*
		 * SCORE IS OUTDATED
		var highScore = localStorage.getItem('highScore');
		var currScore = localStorage.getItem('currScore');
		*/
		var bestTimeObj = JSON.parse(localStorage.getItem('bestTimeObj'));
		var currTimeObj = JSON.parse(localStorage.getItem('currTimeObj'));
		ctx.save();
		ctx.globalAlpha = 1.0;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		app.draw.text(ctx, "You Won!", app.WIDTH/2, 80, this.LARGE_TEXT_SIZE, "white");
		app.draw.text(ctx, "Best Time:", app.WIDTH/2, 180, this.MEDIUM_TEXT_SIZE, "white");
		app.draw.timer(ctx, bestTimeObj, app.WIDTH/2, 230, this.SMALL_TEXT_SIZE, "green", true);
		app.draw.text(ctx, "Current Time:", app.WIDTH/2, 300, this.MEDIUM_TEXT_SIZE, "white");
		app.draw.timer(ctx, currTimeObj, app.WIDTH/2, 350, this.SMALL_TEXT_SIZE, "green", true);
		/*
		 * SCORE IS OUTDATED
		app.draw.text(ctx, "High Score:", app.WIDTH/2, 420, this.MEDIUM_TEXT_SIZE, "white");
		app.draw.text(ctx, highScore, app.WIDTH/2, 470, this.SMALL_TEXT_SIZE, "green");
		app.draw.text(ctx, "Score:", app.WIDTH/2, 540, this.MEDIUM_TEXT_SIZE, "white");
		app.draw.text(ctx, currScore, app.WIDTH/2, 590, this.SMALL_TEXT_SIZE, "green");
		*/
		ctx.restore();
		// add buttons to the buttons array
		if(this.addButtons) {
			// Button(x, y, width, height, text, textSize, screenTarget)
			this.buttons.push(new app.Button(app.WIDTH/2, 640, 180, 40, "Play Again", this.BUTTON_TEXT_SIZE, this.SCREEN_STATE_GAME));
			this.buttons.push(new app.Button(app.WIDTH/2, 700, 180, 40, "Back to Title", this.BUTTON_TEXT_SIZE, this.SCREEN_STATE_TITLE));
			this.addButtons = false;
		}
	},
	
	drawPauseScreen: function(ctx){
		// draw the text ". . . PAUSED . . ." in green and add a shadow
		ctx.save();
		ctx.globalAlpha = 1.0;
		if(this.screenState == this.SCREEN_STATE_GAME && (this.gameScreen.gameState == this.gameScreen.GAME_STATE_DEMOLITION
			|| this.gameScreen.gameState == this.gameScreen.GAME_STATE_DEFAULT)) 
			app.draw.rect(this.ctx, 0, 0, app.WIDTH, app.HEIGHT, "#400", "white");
		else 
			app.draw.rect(this.ctx, 0, 0, app.WIDTH, app.HEIGHT, "black", "white");
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = -5;
		ctx.shadowOffsetY = 5;
		ctx.shadowColor = "#659D32";
		app.draw.text(this.ctx, ". . . PAUSED . . .", app.WIDTH/2, app.HEIGHT/2, 60, "#61B329");
		ctx.restore();
	},
	
	// mouse event
	doMousedown: function(e) {
		e.preventDefault();
		
		// we can only do things if we're not transitioning between states
		// make sure there are buttons. if there are no buttons, we cannot do anything
		if(this.screenState != this.SCREEN_STATE_TRANSITION && this.buttons && !app.paused) {
			// get the mouse position
			this.mouse = app.utilities.getMouse(e);
			
			for(var i = 0; i < this.buttons.length; i++) {
				// check if we clicked a button
				if(app.utilities.pointInRect(this.mouse, this.buttons[i])) {
					createjs.Sound.play("button");
					// check if the target is higher than the highest possible screenState meaning that it represents an instructionsPage
					if(this.buttons[i].screenTarget > this.SCREEN_STATE_TRANSITION) {
						this.instructionsCurrPage = this.buttons[i].screenTarget;
					}
					else {
						// start transisting
						this.screenState = this.SCREEN_STATE_TRANSITION;
						// set the target screen state to the one the button targets
						this.screenStateButtonTarget = this.buttons[i].screenTarget;
					}
				}
			}
		}
	},

	// start game sound track
	startSoundtrack: function() {
		var rand;
		createjs.Sound.stop();
		/*rand = app.utilities.getRandomInt(0, 3);
		switch(rand) {
			case 0:
				createjs.Sound.play("soundtrack1", {loop:-1, volume:0.5});
				break;
			case 1:
				createjs.Sound.play("soundtrack2", {loop:-1, volume:0.5});
				break;
			case 2:
				createjs.Sound.play("soundtrack3", {loop:-1, volume:0.5});
				break;
			case 3:
				createjs.Sound.play("soundtrack4", {loop:-1, volume:0.5});
				break;
		}*/
		createjs.Sound.play("soundtrack1", {loop:-1, volume:0.5});
	},
	
	// start the title background music
	startBackground: function() {
		createjs.Sound.stop();
		createjs.Sound.play("background", {loop:-1, volume:1.0});
	}
};