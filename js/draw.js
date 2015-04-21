// draw.js
// dependencies: none
"use strict";
var app = app || {};

app.draw = {
   clear : function(ctx, x, y, w, h) {
			ctx.clearRect(x, y, w, h);
	},
	
	rect : function(ctx, x, y, w, h, fillCol, strokeCol) {
			if(fillCol != undefined) {
				ctx.fillStyle = fillCol;
				ctx.fillRect(x, y, w, h);
			}
			if(strokeCol != undefined) {
				ctx.strokeStyle = strokeCol;
				ctx.strokeRect(x, y, w, h);
			}
	},
	
	circle : function(ctx, x, y, r, angStart, angEnd, fillCol, strokeCol) {
			if(fillCol != undefined) ctx.fillStyle = fillCol;
			if(strokeCol != undefined) ctx.strokeStyle = strokeCol;
			ctx.beginPath();
			ctx.arc(x, y, r, angStart,  angEnd, true);
			ctx.closePath();
			if(fillCol != undefined) ctx.fill();
			if(strokeCol != undefined) ctx.stroke();
	},
	
	path : function(ctx, points, fillCol, strokeCol) {
		if(fillCol != undefined) ctx.fillStyle = fillCol;
		if(strokeCol != undefined) ctx.strokeStyle = strokeCol;
		ctx.beginPath();
		for(var i = 0; i < points.length; i++) {
			if(i == 0) ctx.moveTo(points[i].x, points[i].y);
			else ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
		if(fillCol != undefined) ctx.fill();
		if(strokeCol != undefined) ctx.stroke();
	},
	
	text : function(ctx, string, x, y, size, col, maxWidth) {
			ctx.font = 'bold '+size+'px Orbitron';
			ctx.fillStyle = col;
			if(maxWidth != undefined) ctx.fillText(string, x, y, maxWidth);
			else ctx.fillText(string, x, y);
	},
	
	timer : function (ctx, timerObj, x, y, size, col, addS){
		// used for timer
		// these will be set to 0 if we need a 0 for the tens places of the timer
		// otherwise, they will be empty
		var zeroForMins = "";
		var zeroForSecs = "";
		ctx.save();
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		// if there are hours, make the with hh:mm:ss
		if(timerObj.hours > 0) {
			// account for values less than 10
			if(timerObj.minutes < 10) zeroForMins = "0";
			else zeroForMins = "";
			if(timerObj.seconds < 10) zeroForSecs = "0";
			else zeroForSecs = "";
			
			this.text(ctx, timerObj.hours + ":" + zeroForMins + timerObj.minutes + ":" + zeroForSecs + timerObj.seconds, x, y, size, col);
		}
		// if there are no hours, but there are minutes make the timer mm:ss
		else if(timerObj.minutes > 0) {
			// account for values less than 10
			if(timerObj.seconds < 10) zeroForSecs = "0";
			else zeroForSecs = "";
			this.text(ctx, timerObj.minutes + ":" + zeroForSecs + timerObj.seconds, x, y, size, col);
		}
		// if there are only seconds, make the timer ss
		else {
			if(addS) this.text(ctx, timerObj.seconds + "s", x, y, size, col);
			else this.text(ctx, timerObj.seconds, x, y, size, col);
		}
		ctx.restore();
	}
};
