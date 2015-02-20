/* jshint node: true */
var debug = require('debug')('doogie');
var express = require('express');
var app = express();

var morgan = require('morgan');
app.use(morgan('dev')); // Use `combined` for production.

var compression = require('compression');
app.use(compression());

require('./models');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/doogie');

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
