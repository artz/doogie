var debug = require('debug')('doogie');
var app = require('express')();
var session = require('express-session');
var env = app.get('env').toLowerCase();
var config = require('../config')[env];
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cors = require('cors');
app.use(cors());

var compression = require('compression');
app.use(compression());

var morgan = require('morgan');
var mongoose = require('mongoose');
require('./models');

app.use(morgan(config.logFormat));
mongoose.connect(config.db);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.twitter.secret));

app.use(session({
	resave: false,
	saveUninitialized: false,
	name: 'doogie',
  secret: config.twitter.secret
}));

require('./auth')(app);

var datadog = require('./datadog');
app.get('/api/services/:serviceId/sparkline', datadog.sparkline);

var meanify = require('meanify')({
	path: '/api',
	pluralize: true,
	puts: true
});
app.use(meanify());

var serveStatic = require('serve-static');
app.use(serveStatic('client/www', {
	maxAge: '1h'
//	index: false
}));

// Route remaining requests to index.
// var path = require('path');
// app.get('/*', function(req, res){
//   res.sendFile(path.resolve(__dirname + '/../client/www/index.html'));
// });

// Start Doogie health checks.
require('./doogie');

app.listen(8081);
debug('Doogie ' + env + ' server running on port 8081.');
