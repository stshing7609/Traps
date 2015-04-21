/*
loader.js
variable app is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of 
the bubbles game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

// CONSTANTS
app.KEYBOARD = {
	"KEY_SPACE": 32, 
	"KEY_R": 82,
	"KEY_F8": 119
};


app.IMAGES = {
	setupStageImage: "images/setupStage.png",
	demolitionStageImage: "images/demolitionStage.png",
	levelCompleteImage: "images/levelComplete.png",
	secondSetupImage: "images/secondSetup.png",
	levelIncompleteImage: "images/levelIncomplete.png"
};

// properties of app that will be accessed by the blastem.js module
app.animationID = undefined;
app.paused = false;
app.WIDTH = 960;
app.HEIGHT = 800;

// app.keydown array to keep track of which keys are down
// this is called a "key daemon"
// blastem.js will "poll" this array every frame
// this works because JS has "sparse arrays" - not every language does
app.keydown = [];

// the Modernizr object is from the modernizr.custom.js file
Modernizr.load(
	{ 
		// load all of these files
		load : [
			'js/polyfills.js',
			'js/utilities.js',
			'js/cell.js',
			'js/traps.js',
			'js/draw.js',
			'js/circleTrap.js',
			'js/diamondTrap.js',
			'js/tearTrap.js',
			'js/pulse.js',
			'js/button.js',
			'js/levels.js',
			'js/gameScreen.js',
			app.IMAGES['setupStageImage'], // ignore console error
			app.IMAGES['demolitionStageImage'], // ignore console error
			app.IMAGES['levelCompleteImage'], // ignore console error
			app.IMAGES['secondSetupImage'], // ignore console error
			app.IMAGES['levelIncompleteImage'] // ignore console error
		],
		
		// when the loading is complete, this function will be called
		complete: function(){
			
			// set up event handlers
			window.onblur = function(){
				app.paused = true;
				cancelAnimationFrame(app.animationID);
				app.keydown = []; // clear key daemon
				// call update() so that our paused screen gets drawn
				app.traps.update();
			};
			
			window.onfocus = function(){
				app.paused = false;
				cancelAnimationFrame(app.animationID);
				// start the animation back up
				app.traps.update();
			};
			
			// event listeners
			window.addEventListener("keydown",function(e){
				//console.log("keydown=" + e.keyCode);
				app.keydown[e.keyCode] = true;
			});
				
			window.addEventListener("keyup",function(e){
				//console.log("keyup=" + e.keyCode);
				app.keydown[e.keyCode] = false;
			});
			
			// start loading sounds
			createjs.Sound.alternateExtensions = ["mp3"];
			createjs.Sound.registerSound({id:"soundtrack1", src:"sounds/soundtrack1.mp3"});
			createjs.Sound.registerSound({id:"background", src:"sounds/background.mp3"});
			createjs.Sound.registerSound({id:"placeTrap", src:"sounds/placeTrap1.wav"});
			createjs.Sound.registerSound({id:"activate", src:"sounds/activate1.wav"});
			createjs.Sound.registerSound({id:"explosion", src:"sounds/explosion1.wav"});
			createjs.Sound.registerSound({id:"newlevel", src:"sounds/newlevel1.mp3"});
			createjs.Sound.registerSound({id:"button", src:"sounds/button1.wav"});
			//createjs.Sound.registerSound({id:"soundtrack2", src:"sounds/soundtrack2.mp3"});
			//createjs.Sound.registerSound({id:"soundtrack3", src:"sounds/soundtrack3.mp3"});
			//createjs.Sound.registerSound({id:"soundtrack4", src:"sounds/soundtrack4.mp3"});
			
			
			createjs.Sound.addEventListener("fileload", handleFileLoad);
			
			function handleFileLoad(e) {
				console.log("Preload Sound:", e.id, e.src);
				if(e.src == "sounds/background.mp3") app.traps.startBackground();
			}
			
			// start game
			app.traps.init();
		} // end complete
		
	} // end object
); // end Modernizr.load
