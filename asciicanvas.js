var ansi = require('ansi');
var bresenham = require('bresenham');

module.exports = AsciiCanvas;
function AsciiCanvas(width, height) {
	this.width = width;
	this.height = height;

	this.pixels = matrix(this.width, this.height);
}

AsciiCanvas.prototype.display = function(out) {
	var cursor = ansi(out);

	out.write('┌' + new Array(this.width*2+1).join('─') + '┐' + '\n');

	for (var y = 0; y < this.height; y++) {
		out.write('│');
		for (var x = 0; x < this.width; x++) {
			this.drawPixel(cursor, this.pixels[y][x]);
		}
		cursor.reset();
		out.write('│');
		out.write('\n');
	}

	out.write('└' + new Array(this.width*2+1).join('─') + '┘' + '\n');
}

AsciiCanvas.prototype.drawPixel = function(cursor, pix) {
	cursor.reset();
	if (pix === undefined) {
		cursor.stream.write('  ');
	} else {
		if (pix.bg !== undefined) cursor.bg.hex(pix.bg);
		if (pix.fg !== undefined) cursor.fg.hex(pix.fg);

		var str = pix.chr || ' ';
		cursor.stream.write(str[0] + ' ');
	}
}

AsciiCanvas.prototype.dot = function(x, y, pix) {
	x = Math.round(x);
	y = Math.round(y);

	if (!this.insideBounds(x, y)) {
		return;
	}

	if (pix === undefined) pix = {};
	if (pix.chr === undefined) pix.chr = '•';

	this.pixels[y][x] = pix;
}

AsciiCanvas.prototype.line = function(x0, y0, x1, y1, pix) {
	x0 = Math.round(x0);
	y0 = Math.round(y0);
	x1 = Math.round(x1);
	y1 = Math.round(y1);

	if (pix === undefined) pix = {};

	bresenham(x0, y0, x1, y1, function(x, y) {
		if (!this.insideBounds(x, y)) {
			return;
		}

		this.pixels[y][x] = pix;
	}.bind(this));
}

AsciiCanvas.prototype.insideBounds = function(x, y) {
	return x >= 0 && y >= 0 && x < this.width && y < this.height;
}

function matrix(width, height) {
	var mat = new Array(height);
	for (var i = 0; i < height; i++) {
		mat[i] = new Array(width);
	}
	return mat;
}
