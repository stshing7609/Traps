// utilities.js
// dependencies: none
"use strict";
var app = app || {};

app.utilities = function(){

	/*
		Function Name: clamp(val, min, max)
		Return Value: returns a value that is constrained between min and max (inclusive) 
	*/
	function clamp(val, min, max){
		return Math.max(min, Math.min(max, val));
	}
	
	
	/*
		Function Name: getRandom(min, max)
		Return Value: a floating point random number between min and max
	*/
	function getRandom(min, max) {
	  return Math.random() * (max - min) + min;
	}
	
	
	/*
		Function Name: getRandomInt(min, max)
		Return Value: a random integer between min and max
	*/
	function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	
	/*
		Function Name: degreesToRadians(degrees)
		Return Value: a floating point number in radians
	*/
	function degreesToRadians(degrees) {
		return degrees * Math.PI/180;
	}
	
	/*
		Function Name: secondsToTime(secs)
		Return Value: a object containing hours, minutes, and seconds
	*/
	function secondsToTime(secs) {
		var hours = Math.floor(secs / (60*60));
		
		var minuteDivisor = secs % (60*60);
		var minutes = Math.floor(minuteDivisor/60);
		
		var secondDivisor = minuteDivisor % 60;
		var seconds = Math.ceil(secondDivisor);
		
		var time = {
			"hours": hours,
			"minutes": minutes,
			"seconds": seconds
		};
		
		return time;
	}
	
	/*
		Function Name: timeToSeconds(timerObj)
		Return Value: a time of hh:mm:ss to seconds
	*/
	function timeToSeconds(timerObj) {
		return timerObj.hours*60*60 + timerObj.minutes*60 + timerObj.seconds;
	}
	
	// returns mouse position in local coordinate system of element
		function getMouse(e){
			var mouse = {}
			mouse.x = e.pageX - e.target.offsetLeft;
			mouse.y = e.pageY - e.target.offsetTop;
			return mouse;
		}
	
	/*
		Function Name: getMouse(ctx, e)
		Return Value: an object of the mouseX and mouseY positions
	*/
	/*
	function getMouse(canvas, e) {
		// account for where the canvas is in the window as well as the size of the window
		var boundRect = canvas.getBoundingClientRect();
		return {
			x: (e.pageX - boundRect.left)*(canvas.width/boundRect.width),
			y: (e.pageY - boundRect.top)*(canvas.height/boundRect.height)
		}
	}
	*/
	/*
		Function Name: pointInRect(pt, rect)
		Return Value: a bool if the point is in a rectangle
	*/
	function pointInRect(pt, rect) {
		return pt.x < rect.x + rect.width/2 &&
			   pt.x > rect.x - rect.width/2 &&
			   pt.y < rect.y + rect.height/2 &&
			   pt.y > rect.y - rect.height/2;
	}
	
	/*
		Function Name: pointinCirc(pt, circ)
		Return Value: a bool ifa point is in a circle
	*/
	function pointInCirc(pt, circ) {
		var dx = circ.x - pt.x;
		var dy = circ.y - pt.y;
	
		return(dx*dx + dy*dy < circ.r*circ.r);
	}
	
	return{
		clamp : clamp,
		getRandom : getRandom,
		getRandomInt : getRandomInt,
		degreesToRadians: degreesToRadians,
		secondsToTime: secondsToTime,
		timeToSeconds: timeToSeconds,
		getMouse: getMouse,
		pointInRect: pointInRect,
		pointInCirc: pointInCirc
	};
}();
