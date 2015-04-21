// pulse.js
"use strict";

var app = app || {};

app.Pulse = function() {
	function Pulse(x, y, maxR) {
		this.x = x;
		this.y = y;
		this.maxR = maxR + 20;
		this.strokeCol = "white";
		this.r = 4;
		this.expandRate = .5;
		this.remove = false;
	};
	
	var p = Pulse.prototype;
	
	p.update = function() {
		this.r += this.expandRate;
		this.remove = (this.r >= this.maxR) ? true : false;
	};
	
	p.draw = function(ctx) {
		app.draw.circle(ctx, this.x, this.y, this.r, 0, Math.PI * 2, undefined, this.strokeCol);
	};
	
	return Pulse;
}();