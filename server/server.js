/* jshint node: true */
'use strict';

var debug = require('debug')('doogie');
var app = require('express')();

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

var datadog = require('./datadog');
app.get('/api/services/:serviceId/sparkline', datadog.sparkline);

require('./models');
var meanify = require('meanify')({
	path: '/api',
	pluralize: true,
	puts: true
});
app.use(meanify());

// Start Doogie health checks.
require('./doogie');

var serveStatic = require('serve-static');
app.use(serveStatic('client/www', {
	maxAge: '1h'
}));

app.listen(8081);
debug('Doogie server running on port 8081.');
