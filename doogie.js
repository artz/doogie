var request = require('request');
var mongoose = require('mongoose');
var debug = require('debug')('doogie');
var datadog = require('./datadog');
var Check = mongoose.model('Check');

setInterval(runChecks, 60000);
runChecks();

function runChecks() {
	debug('Running host checks...');
	Check.find({})
		.populate('_service')
		.exec(function (err, checks) {
		checks.forEach(function (check) {
			debug('Checking ' + check.url + '...');
			var info = {
				host: check,
				responseStart: new Date()
			};
			request({
				url: check.url,
				timeout: 3000, // 3 second timeout
			}, function (err, res, body) {
				info.responseEnd = new Date();
				info.responseTime = info.responseEnd - info.responseStart;
				info.body = body;
				info.response = res;
				datadog(err, info);
			});
		});
	});
}
