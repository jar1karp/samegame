/*
    SameGame for JavaScript/canvas
    Copyright (C) 2012  Jari Karppinen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var canvas;
var context;
var size;
var rows;
var cols;
var board;
var pieces;
var score;
var high;

function init()
{
	canvas = document.getElementById("game");
	canvas.onclick = mouseClick;
	context = canvas.getContext("2d");
	size = 50;
	rows = canvas.height/size;
	cols = canvas.width/size;
	initBoard();
	high = 0;
	render();
}

function initBoard()
{
	board = new Array(rows);
	for (var y = 0; y < rows; y++)
	{
		board[y] = new Array(cols);
		for (var x = 0; x < cols; x++)
		{
			board[y][x] = Math.floor(4*Math.random())+1;
		}
	}
	pieces = rows*cols;
	score = 0;
}

function render()
{
	context.fillStyle="rgb(0,0,0)";
	context.fillRect(0,0, canvas.width, canvas.height);
	for (var y = 0; y < rows; y++)
	{
		for (var x = 0; x < cols; x++)
		{
			if (board[y][x] == 0)
				continue;
			switch (board[y][x])
			{
			case 1: context.fillStyle="rgb(255,0,0)"; break;
			case 2: context.fillStyle="rgb(0,255,0)"; break;
			case 3: context.fillStyle="rgb(0,0,255)"; break;
			case 4: context.fillStyle="rgb(255,255,0)"; break;
			}
			context.beginPath();
			context.arc((x+0.5)*size,(y+0.5)*size,size/2,0,Math.PI*2,true);
			context.closePath();
			context.fill();
		}
	}
	document.getElementById("score").innerHTML = "Score: " + score;
	document.getElementById("high").innerHTML = "High: " + high;
}

function mouseClick(event)
{
	var mx;
	var my;

	if (event.pageX || event.pageY)
	{ 
		mx = event.pageX;
		my = event.pageY;
	}
	else
	{ 
		mx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		my = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	}

	if ((mx < canvas.offsetLeft || mx >= canvas.offsetLeft + canvas.width) ||
	    (my < canvas.offsetTop || my >= canvas.offsetTop + canvas.height))
		return;

	mx -= canvas.offsetLeft;
	my -= canvas.offsetTop;

	var x = Math.floor(mx / size);
	var y = Math.floor(my / size);

	if (countNeighbours(x, y) > 0)
	{
		var n = removePieces(x, y, board[y][x]);
		pieces -= n;
		score += (n-1)*(n-1);
		if (pieces == 0)
			score *= 2;
		if (score > high)
			high = score;
		updateBoard();
		render();
	}
	
	if (noCombinations() && window.confirm("No more moves, play again?"))
	{
		initBoard();
		render();
	}
}

function countNeighbours(x, y)
{
	var color = board[y][x];
	var count = 0;

	if (color > 0)
	{
		if (x > 0 && board[y][x-1] == color)
			count++;
		if (x < cols-1 && board[y][x+1] == color)
			count++;
		if (y > 0 && board[y-1][x] == color)
			count++;
		if (y < rows-1 && board[y+1][x] == color)
			count++;
	}

	return count;
}

function removePieces(x, y, color)
{
	return recursiveRemovePieces(x, y, color);
}

function recursiveRemovePieces(x, y, color)
{
	if (board[y][x] == color)
	{
		var count = 1;
		board[y][x] = 0;
		if (x > 0)
			count += recursiveRemovePieces(x-1, y, color);
		if (x < cols-1)
			count += recursiveRemovePieces(x+1, y, color);
		if (y > 0)
			count += recursiveRemovePieces(x, y-1, color);
		if (y < rows-1)
			count += recursiveRemovePieces(x, y+1, color);
		return count;
	}
	return 0;
}

function updateBoard()
{
	var x, y, z;

	for (x = cols-1; x >= 0; x--)
	{
		for (y = rows-1; y >= 0; y--)
		{
			if (board[y][x] > 0)
				continue;
			z = y - 1;
			while (z >= 0 && board[z][x] == 0)
				z--;
			if (z >= 0)
			{
				board[y][x] = board[z][x];
				board[z][x] = 0;
			}
		}
		if (board[rows-1][x] == 0)
		{
			for (y = rows-1; y >= 0; y--)
			{
				for (z = x + 1; z < cols; z++)
				{
					board[y][z-1] = board[y][z];
					board[y][z] = 0;
				}
			}
		}
	}
}

function noCombinations()
{
	var x, y;

	for (x = cols-1; x >= 0; x--)
	{
		for (y = rows-1; y >= 0; y--)
		{
		if (board[y][x] == 0)
			continue;
		if ((x < cols-1 && board[y][x+1] == board[y][x]) ||
		    (y < rows-1 && board[y+1][x] == board[y][x]))
			return false;
		}
	}

	return true;
}
