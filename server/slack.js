var debug = require('debug')('doogie');
var request = require('request');
var app = require('express')();
var env = app.get('env').toLowerCase();
var config = require('../config')[env];

module.exports = {

	event: function slackEvent(event) {
		var service = event.service;
		var status = event.status;
		var payload = {
			channel: config.slack.updateChannel,
			text: '[' + service.name + ' ' + status.name + '] ' + event.message
		};

		// debug('Slack Request', payload);
		request.post({
			url: config.slack.api,
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
				channel: config.slack.alertChannel,
				text: info.text
			};

			// debug('Slack Request', payload);
			request.post({
				url: config.slack.api,
				json: true,
				body: payload
			}, function (err, response, body) {
				// debug('Slack Response', err || body);
			});
		}
	}
};
