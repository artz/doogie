/* jshint node: true */
var debug = require('debug')('doogie');

var express = require('express');
var app = express();

var compression = require('compression');
app.use(compression());

var morgan = require('morgan');
var mongoose = require('mongoose');
if (app.get('env') === 'development') {
	app.use(morgan('dev'));
	mongoose.connect('mongodb://localhost/doogie');
} else {
	app.use(morgan('combined'));
	mongoose.connect('mongodb://ec2-52-0-24-9.compute-1.amazonaws.com/doogie');
}

require('./models');
var meanify = require('meanify')({
	path: '/api',
	pluralize: true,
	puts: true
});
app.use(meanify());

require('./doogie');

var serveStatic = require('serve-static');
app.use(serveStatic('client/www'));

app.listen(8081);
debug('Doogie server running on port 8081.');
