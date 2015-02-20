/* jshint node: true */
'use strict';

var debug = require('debug')('doogie');
var request = require('request');
var SLACK_API = 'https://hooks.slack.com/services/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';
/*
{
	"channel": "#general",
	"username": "webhookbot",
	"text": "This is posted to #general and comes from a bot named webhookbot.",
	"icon_emoji": ":ghost:"
}
*/

module.exports = {

	event: function slackEvent(event) {
		var service = event.service;
		var status = event.status;
		var payload = {
			channel: '#amp-success',
			text: '(Testing) [' + service.name + ' ' + status.name + '] ' + event.message
		};

		// debug('Slack Request', payload);
		request.post({
			url: SLACK_API,
			json: true,
			body: payload
		}, function (err, response, body) {
			// debug('Slack Response', err || body);
		});
	},

	alert: function slackAlert(info) {
		return;
		// POST to Slack webhook API.
		if (info.alertType !== 'success') {
			var payload = {
				channel: '#amp-success',
				text: info.alertType.toUpperCase() + ': ' + info.text
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
	}
};
