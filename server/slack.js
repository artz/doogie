/* jshint node: true */
'use strict';

var debug = require('debug')('doogie');
var request = require('request');
var config = require('../config');

var SLACK_API = config.slack.api;

module.exports = {

	event: function slackEvent(event) {
		var service = event.service;
		var status = event.status;
		var payload = {
			channel: config.updateChannel,
			text: '[' + service.name + ' ' + status.name + '] ' + event.message
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
		// POST to Slack webhook API.
		if (info.alertType === 'error') {
			var payload = {
				channel: config.alertChannel,
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
