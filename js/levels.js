/*	Name: levels.js
 *	Author: Steven Shing
 *
 *	README
 *
 *	traps is the array of types of traps in the level
 *	All traps of the same type must be adjacent to each other in the traps array
 *	In a traps array there is a special keyword called, "change"
 *	"change" indicates that a different format of the trap before in the array is created. i.e. the first only shoots up, the second only shoots left
 *	"change" can NEVER be the first or last element in an array
 *
 *	diamondDirections is an array of objects that hold the directions a diamond trap can fire
 *	The format of an object in the array is {up: BOOL, down: BOOL, left: BOOL, right: BOOL}
 *	If there are any "change" keywords in the traps array, diamondDirections will have multiple objects
 *	A "change" indicates that any "diamond" traps that follow the keyword will use object at the next index in diamondDirections
 *	
 *	tearDirections is an array of strings that holds the direction a tear trap can fire
 *	The possible components of this array are "up", "down", "left", "right"
 *	This is very similar to diamondDirections in terms of the "change" keyword
 *
 *	The following is not used (yet)
 *	obstacles is the array of types of obstacles in the level
 * 	All obstacles of the same type must be adjacent to each other in the obstacles array
 */
"use strict";

var app = app || {};

app.levels = [
	// level 1
	{
		// 2 traps
		traps: [
			"circle",
			"circle",
		],
		diamondDirections: [],
		tearDirections: [],
		obstacles: []
	},
	// level 2
	{
		// 3 traps
		traps: [
			"circle",
			"circle",
			"diamond"
		],
		diamondDirections: [
			{up: true, down: true, left: true, right: true}
		],
		tearDirections: [],
		obstacles: []
	},
	// level 3
	{
		// 4 traps
		traps: [
			"circle",
			"circle",
			"diamond",
			"change",
			"diamond"
		],
		diamondDirections: [
			{up: false, down: false, left: true, right: true},
			{up: true, down: true, left: false, right: false}
		],
		tearDirections: [],
		obstacles: []
	},
	// level 4
	{
		// 5 traps
		traps: [
			"circle",
			"circle",
			"circle",
			"diamond",
			"diamond"
		],
		diamondDirections: [
			{up: true, down: false, left: false, right: true}
		],
		tearDirections: [],
		obstacles: []
	},
	// level 5
	{
		// 6 traps
		traps: [
			"circle",
			"diamond",
			"diamond",
			"change",
			"diamond",
			"diamond",
			"diamond"
		],
		diamondDirections: [
			{up: false, down: true, left: false, right: false},
			{up: false, down: false, left: true, right:true}
		],
		tearDirections: [],
		obstacles: []
	},
	// level 6
	{
		// 3 traps
		traps: [
			"diamond",
			"change",
			"diamond",
			"tear"
		],
		diamondDirections: [
			{up: false, down: false, left: true, right: false},
			{up: true, down: false, left: true, right:true}
		],
		tearDirections: ["right"],
		obstacles: []
	},
	// level 7
	{
		// 4 traps
		traps: [
			"diamond",
			"change",
			"diamond",
			"change",
			"diamond",
			"change",
			"diamond",
			"tear",
			"tear",
		],
		diamondDirections: [
			{up: true, down: false, left: false, right: false},
			{up: false, down: true, left: false, right: false},
			{up: false, down: false, left: true, right: false}, 
			{up: false, down: false, left: true, right: true}
		],
		tearDirections: ["up"],
		obstacles: []
	},
	// level 8
	{
		// 8 traps
		traps: [
			"diamond",
			"diamond",
			"diamond",
			"change",
			"diamond",
			"diamond",
			"tear",
			"tear",
			"change",
			"tear",
		],
		diamondDirections: [
			{up: false, down: false, left: true, right: true},
			{up: true, down: true, left: false, right: false}
		],
		tearDirections: ["left", "right"],
		obstacles: []
	}
];