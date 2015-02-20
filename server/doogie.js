/* jshint node: true */
'use strict';
var request = require('request');
var mongoose = require('mongoose');
var debug = require('debug')('doogie');
var datadog = require('./datadog');
var slack = require('./slack');
var Check = mongoose.model('Check');

setInterval(runChecks, 2 * 60 * 1000); // 2 minute interval.
runChecks();

function runChecks() {
	debug('Running host checks...');
	Check.find({})
		.populate('_service')
		.exec(function (err, checks) {
		checks.forEach(function (check) {
			debug('Checking ' + check.url + '...');
			var alert = {
				check: check,
				service: check._service,
				url: check.url,
				responseStart: new Date()
			};
			request({
				url: check.url,
				timeout: 10000, // 10 second timeout
			}, function (err, response, body) {
				alert.response = response;
				alert.body = body;
				alert.responseEnd = new Date();
				alert.responseTime = alert.responseEnd - alert.responseStart;
				handleResults(err, alert);
			});
		});
	});
}

function handleResults(err, alert) {

	var check = alert.check;

	var successCodeRegExp = check.successCode ? new RegExp(check.successCode) : new RegExp('^2[0-9][0-9]$');
	var errorCodeRegExp = check.errorCode ? new RegExp(check.errorCode) : undefined;
	var successResponseTime = check.successResponseTime ? check.successResponseTime : 1000;
	var errorResponseTime = check.errorResponseTime ? check.errorResponseTime : 6000;

	var alertType = 'success';
	var text = '';

	// Response time check.
	var responseTime = alert.responseTime;
	var responseTimeStatus = 'normal';
	if (responseTime > successResponseTime && responseTime < errorResponseTime) {
		alertType = 'warning';
		text += ' Elevated (+' + successResponseTime + 'ms) response time of ' + alert.responseTime + 'ms: ' + alert.check.url;
		responseTimeStatus = 'elevated';
	} else if (responseTime >= errorResponseTime) {
		alertType = 'error';
		text += ' High (+ ' + errorResponseTime + 'ms) response time of ' + alert.responseTime + 'ms: ' + alert.check.url;
		responseTimeStatus = 'high';
	}

	// Status code check.
	var response = alert.response;
	var statusCode;
	if (err) {
		statusCode = '0';
		alertType = 'error';
		text += 'No response from server: ' + alert.check.url;
	} else {
		statusCode = response.statusCode.toString();
		if (successCodeRegExp && !successCodeRegExp.test(statusCode)) {
			alertType = 'error';
			text += ' Unexpected response status code of ' + statusCode + ': ' + alert.check.url;
		} else if (errorCodeRegExp && errorCodeRegExp.test(statusCode)) {
			alertType = 'error';
			text += ' Unexpected response status code of ' + statusCode + ': ' + alert.check.url;
		}
	}

	alert.text = text;
	alert.alertType = alertType;
	alert.statusCode = statusCode;
	alert.responseTimeStatus = responseTimeStatus;

	datadog(alert);
	slack.alert(alert);
}
