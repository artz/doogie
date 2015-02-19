var request = require('request');
var debug = require('debug')('doogie');
var url = require('url');

var DATADOG_API = 'https://app.datadoghq.com/api/v1/events?api_key=9ce6531be415dd204c4ca03a016adebb&application_key=7ff57aa5e1f7ffe9e55a329e031bcad92f8a6ed7';

module.exports = function datadog(err, info) {

	var host = info.host;
	var response = info.response;
	var alertType = 'success';
	var responseTime = info.responseTime;
	var statusCode;
	var text = '';

	if (responseTime < 500) {
		responseTime = 'normal';
	} else if (responseTime < 2000) {
		alertType = 'warning';
		text += 'Elevated (+500ms) response time: ' + info.responseTime + 'ms. '
		responseTime = 'elevated';
	} else {
		alertType = 'warning'
		text += 'High (+2000ms) response time: ' + info.responseTime + 'ms. '
		responseTime = 'high';
	}

	if (err) {
		statusCode = '0';
		alertType = 'error';
		text += 'No response from server: ' + info.host;
	} else {
		statusCode = response.statusCode.toString();
		if (statusCode.charAt(0) !== '2') {
			alertType = 'error';
			text += 'Unexpected response code (' + statusCode + ') from server: ' + info.host;
		}
	}

	var arguments = {
		title: host._service.name + ' (' + host.name + ')',
		text: text,
		alert_type: alertType, // "error", "warning", "info" or "success"
		priority: 'normal', // "normal", "low"
		aggregation_key: host._service.name,
		host: url.parse(host.url).host,
		source_type_name: 'doogie',
		tags: [
			'path:' + host.url,
			'statusCode:' + statusCode,
			'responseTime:' + responseTime
		]
	};

	request.post({
		url: DATADOG_API,
		json: true,
		body: arguments
	}, function (err, response, body) {
		debug('Datadog Response', body);
	});

	debug(arguments);

};
