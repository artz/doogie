var express = require('express');
var morgan = require('morgan');
var debug = require('debug')('doogie');

var app = express();
app.use(morgan('dev')); // Use `combined` for production.

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

app.listen(3001);
debug('Doogie server running on port 3001.');
