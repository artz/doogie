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
			var info = {
				check: check,
				service: check._service,
				url: check.url,
				responseStart: new Date()
			};
			request({
				url: check.url,
				timeout: 10000, // 10 second timeout
			}, function (err, response, body) {
				info.response = response;
				info.body = body;
				info.responseEnd = new Date();
				info.responseTime = info.responseEnd - info.responseStart;
				handleResults(err, info);
			});
		});
	});
}

function handleResults(err, info) {

	var check = info.check;

	var successCodeRegExp = check.successCode ? new RegExp(check.successCode) : new RegExp('^2[0-9][0-9]$');
	var errorCodeRegExp = check.errorCode ? new RegExp(check.errorCode) : undefined;
	var successResponseTime = check.successResponseTime ? check.successResponseTime : 1000;
	var errorResponseTime = check.errorResponseTime ? check.errorResponseTime : 6000;

	var alertType = 'success';
	var text = '';

	// Response time check.
	var responseTime = info.responseTime;
	var responseTimeStatus = 'normal';
	if (responseTime > successResponseTime && responseTime < errorResponseTime) {
		alertType = 'warning';
		text += ' Elevated (+' + successResponseTime + 'ms) response time of ' + info.responseTime + 'ms: ' + info.check.url;
		responseTimeStatus = 'elevated';
	} else if (responseTime >= errorResponseTime) {
		alertType = 'error';
		text += ' High (+ ' + errorResponseTime + 'ms) response time of ' + info.responseTime + 'ms: ' + info.check.url;
		responseTimeStatus = 'high';
	}

	// Status code check.
	var response = info.response;
	var statusCode;
	if (err) {
		statusCode = '0';
		alertType = 'error';
		text += 'No response from server: ' + info.check.url;
	} else {
		statusCode = response.statusCode.toString();
		if (successCodeRegExp && !successCodeRegExp.test(statusCode)) {
			alertType = 'error';
			text += ' Unexpected response status code of ' + statusCode + ': ' + info.check.url;
		} else if (errorCodeRegExp && errorCodeRegExp.test(statusCode)) {
			alertType = 'error';
			text += ' Unexpected response status code of ' + statusCode + ': ' + info.check.url;
		}
	}

	info.text = text;
	info.alertType = alertType;
	info.statusCode = statusCode;
	info.responseTimeStatus = responseTimeStatus;

	datadog(err, info);
	slack(err, info);
}
