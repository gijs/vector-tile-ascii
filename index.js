#!/usr/bin/env node

var fs = require('fs');
var cli = require('cli');
var vt = require('vector-tile');
var Pbf = require('pbf');
var each = require('foreach');
var AsciiCanvas = require('./asciicanvas');


var style = {
	'water':    {chr: '~', bg: '#00afff', fg: '#000000'},
	'landuse':  {chr: '^', bg: '#afff00', fg: '#000000'},
	'building': {chr: ' ', bg: '#ffffff', fg: '#000000'},
	'road':     {chr: '◾', bg: '#000000', fg: '#dfdfff'},
};

// Aliases
style['waterway'] = style['water'];
style['bridge'] = style['road'];


cli.setUsage('node index.js [OPTIONS] FILE.vector.pbf');
cli.parse({
	size: ['s', 'Tile output size', 'number']
});


cli.main(function(args, options) {
	if (args.length == 0) {
		cli.getUsage();
		return;
	}

	each(args, function(fileName) {
		var tile = loadTile(fileName);
		if (tile == undefined) return;

		renderTile(tile, options);
	});
});


function loadTile(fileName) {
	try {
		var data = new Pbf(fs.readFileSync(fileName));
		return new vt.VectorTile(data);
	} catch (e) {
		console.error('error: could not read tile')
		return;
	}
}


function renderTile(tile, options) {
	var dim;
	if (options.size) {
		dim = Math.max(options.size, 0);
	} else if (process.stdout.columns) {
		dim = Math.floor(process.stdout.columns/2 - 2);
		dim = Math.max(dim, 8);
		dim = Math.min(dim, 64);
	} else {
		dim = 32;
	}

	var canvas = new AsciiCanvas(dim, dim);

	each(tile.layers, function(layer, name) {
		if (name.indexOf('_label') > 0) return;
		if (style[name] === undefined) return;

		for (var i = 0; i < layer.length; i++) {
			drawFeature(canvas, layer, layer.feature(i));
		}
	});

	canvas.display(process.stdout);
}


function drawFeature(canvas, layer, feature) {
	var type = vt.VectorTileFeature.types[feature.type];
	var lines = feature.loadGeometry();
	var pix = style[layer.name];

	each(lines, function(line) {

		if (type == 'Unknown' || type == 'Point') {
			each(line, function(vertex) {
				var x = vertex.x / feature.extent * canvas.width;
				var y = vertex.y / feature.extent * canvas.height;
				canvas.dot(x, y, pix);
			});
		} else if (type == 'LineString' || type == 'Polygon') {
			var x0 = line[0].x / feature.extent * canvas.width;
			var y0 = line[0].y / feature.extent * canvas.height;

			each(line.slice(1), function(vertex) {
				var x1 = vertex.x / feature.extent * canvas.width;
				var y1 = vertex.y / feature.extent * canvas.height;
				canvas.line(x0, y0, x1, y1, pix);
				x0 = x1;
				y0 = y1;
			});
		}
	});
};
