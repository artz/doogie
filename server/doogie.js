var request = require('request');
var mongoose = require('mongoose');
var debug = require('debug')('doogie');
var datadog = require('./datadog');
var slack = require('./slack');
var Check = mongoose.model('Check');
var colors = require('colors');
var ms = require('ms');
var app = require('express')();
var env = app.get('env').toLowerCase();
var config = require('../config')[env];

colors.setTheme({
	success: 'green',
	warning: 'yellow',
	error: 'red'
});

setInterval(runChecks, ms(config.checkInterval)); // Convert from minutes to milliseconds.
runChecks();
function runChecks() {
	Check.find({})
		.populate('_service')
		.exec(function (err, checks) {
		checks.forEach(function (check) {

			var checkRetry = config.checkRetry;
			var verified = false;

			go();
			function go() {

				var alert = {
					check: check,
					service: check._service,
					url: check.url,
					responseStart: new Date()
				};

				request({
					method: check.method,
					url: check.url,
					headers: check.headers,
					timeout: ms(config.checkTimeout),
				}, function (err, response, body) {

					alert.error = err;
					alert.response = response;
					alert.body = body;
					alert.responseEnd = new Date();
					alert.responseTime = alert.responseEnd - alert.responseStart;

					alert = createAlert(err, alert);

					var symbol = alert.alertType === 'success' ? '✔' : '✘';
					debug(symbol[alert.alertType] + ' ' + alert.check.method + ' ' + alert.url + (' ➜ ' +
						(verified ? 'verified ' : '') +
						alert.alertType)[alert.alertType] + ' ' + alert.statusCode + ' ' + alert.responseTime + 'ms');

					if (alert.alertType !== 'success' && checkRetry) {
						// debug(alert.body, alert.error);
						verified = true;
						checkRetry -= 1;
						return go();
					}

					alert.verified = verified;
					datadog.alert(alert);
					slack.alert(alert);

				});
			}
		});
	});
}

function createAlert(err, alert) {

	var check = alert.check;

	var successCodeRegExp = check.successCode ? new RegExp(check.successCode) : new RegExp('^2[0-9][0-9]$');
	var errorCodeRegExp = check.errorCode ? new RegExp(check.errorCode) : undefined;
	var successResponseTime = check.successResponseTime ? check.successResponseTime : 1000;
	var errorResponseTime = check.errorResponseTime ? check.errorResponseTime : 6000;

	var alertType = 'success';
	var text;

	// Response time check.
	var responseTime = alert.responseTime;
	var responseTimeStatus = 'normal';
	if (responseTime > successResponseTime && responseTime < errorResponseTime) {
		alertType = 'warning';
		text = 'Elevated (+' + successResponseTime + 'ms) response time of ' + alert.responseTime + 'ms: ' + alert.check.url;
		responseTimeStatus = 'elevated';
	} else if (responseTime >= errorResponseTime) {
		alertType = 'error';
		text = 'High (+ ' + errorResponseTime + 'ms) response time of ' + alert.responseTime + 'ms: ' + alert.check.url;
		responseTimeStatus = 'high';
	}

	// Status code check.
	var response = alert.response;
	var statusCode;
	if (err) {
		statusCode = '0';
		alertType = 'error';
		switch (err.code) {
			case 'ETIMEDOUT':
				text = 'Response timeout limit (' +  ms(config.checkTimeout) + 'ms) exceeded: ' + alert.check.url;
				break;
			case 'ENOTFOUND':
				text = 'No response from server: ' + alert.check.url;
				break;
			default:
				text = err.toString();
		}

	} else {
		statusCode = response.statusCode.toString();
		if (successCodeRegExp && !successCodeRegExp.test(statusCode)) {
			alertType = 'error';
			text = ' Unexpected response status code of ' + statusCode + ': ' + alert.check.url;
		} else if (errorCodeRegExp && errorCodeRegExp.test(statusCode)) {
			alertType = 'error';
			text = ' Unexpected response status code of ' + statusCode + ': ' + alert.check.url;
		}
	}

	alert.text = text;
	alert.alertType = alertType;
	alert.statusCode = statusCode;
	alert.responseTimeStatus = responseTimeStatus;

	return alert;
}
