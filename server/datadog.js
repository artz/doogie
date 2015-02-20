/* jshint node: true */
'use strict';

var request = require('request');
var debug = require('debug')('doogie');
var url = require('url');
var DATADOG_API = 'https://app.datadoghq.com/api/v1/events?api_key=9ce6531be415dd204c4ca03a016adebb&application_key=7ff57aa5e1f7ffe9e55a329e031bcad92f8a6ed7';

module.exports = function datadog(alert) {

	// POST to DataDog events API.
	var payload = {
		title: alert.service.name + ' (' + alert.check.name + ')',
		text: alert.text,
		alert_type: alert.alertType, // "error", "warning", "info" or "success"
		priority: 'normal', // "normal", "low"
		aggregation_key: alert.service.name,
		host: url.parse(alert.url).host,
		source_type_name: 'doogie',
		tags: [
			'service:' + alert.service.name,
			'check:' + alert.check.name,
			'url:' + alert.url,
			'statusCode:' + alert.statusCode,
			'responseTime:' + alert.responseTimeStatus
		]
	};

	// debug('DataDog Request', payload);
	request.post({
		url: DATADOG_API,
		json: true,
		body: payload
	}, function (err, response, body) {
		// debug('DataDog Response', err || body);
	});

};
