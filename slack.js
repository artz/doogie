/* jshint node: true */
'use strict';

var debug = require('debug')('doogie');
var request = require('request');
var SLACK_API = 'https://hooks.slack.com/services/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';

module.exports = function slack(err, info) {

	// POST to Slack webhook API.
	if (info.alertType !== 'success') {
		var payload = {
			text: info.alertType.toUpperCase() + ' ' + info.text
		};

		// debug('Slack Request', payload);
		request.post({
			url: SLACK_API,
			json: true,
			body: payload
		}, function (err, response, body) {
			// debug('Slack Response', err || body);
		});
	}

};
