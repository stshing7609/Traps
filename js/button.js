// button.js
"use strict";

var app = app || {};

app.Button = function() {
	function Button(x, y, width, height, text, textSize, screenTarget) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.text = text;
		this.textSize = textSize;
		this.screenTarget = screenTarget;
	};
	
	var p = Button.prototype;
	
	p.draw = function(ctx) {
		var halfW = this.width/2;
		var halfH = this.height/2;
		ctx.save();
		ctx.translate(this.x, this.y);
		// forest green buttons
		app.draw.rect(ctx, -halfW, -halfH, this.width, this.height, "#005000", "#bbb");
		ctx.restore();
		ctx.save();
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		app.draw.text(ctx, this.text, this.x, this.y, this.textSize, "white", this.width);
		ctx.restore();
	};
	
	return Button;
}();