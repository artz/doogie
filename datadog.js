/* jshint node: true */
'use strict';

var request = require('request');
var debug = require('debug')('doogie');
var url = require('url');
var DATADOG_API = 'https://app.datadoghq.com/api/v1/events?api_key=9ce6531be415dd204c4ca03a016adebb&application_key=7ff57aa5e1f7ffe9e55a329e031bcad92f8a6ed7';

module.exports = function datadog(err, info) {

	// POST to DataDog events API.
	var payload = {
		title: info.service.name + ' (' + info.check.name + ')',
		text: info.text,
		alert_type: info.alertType, // "error", "warning", "info" or "success"
		priority: 'normal', // "normal", "low"
		aggregation_key: info.service.name,
		host: url.parse(info.url).host,
		source_type_name: 'doogie',
		tags: [
			'service:' + info.service.name,
			'check:' + info.check.name,
			'url:' + info.url,
			'statusCode:' + info.statusCode,
			'responseTime:' + info.responseTimeStatus
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
