/* jshint node: true */
'use strict';

var request = require('request');
var debug = require('debug')('doogie');
var app = require('express')();
var url = require('url');
var DATADOG_API = 'https://app.datadoghq.com/api/v1/events?api_key=9ce6531be415dd204c4ca03a016adebb&application_key=7ff57aa5e1f7ffe9e55a329e031bcad92f8a6ed7';

module.exports = {
	alert: function datadogAlert(alert) {

		// POST to DataDog events API.
		var payload = {
			title: alert.service.name + ' (' + alert.check.name + ')',
			text: alert.text,
			alert_type: alert.alertType, // "error", "warning", "info" or "success"
			priority: 'normal', // "normal", "low"
			aggregation_key: alert.service.name,
			host: url.parse(alert.url).host,
			source_type_name: 'user',
			tags: [
				'doogie',
				'env:' + app.get('env'),
				'service_id:' + alert.service._id,
				'check_id:' + alert.check._id,
				'url:' + alert.url,
				'statusCode:' + alert.statusCode,
				'responseTime:' + alert.responseTimeStatus
			]
		};

		debug('DataDog Request', payload);
		request.post({
			url: DATADOG_API,
			json: true,
			body: payload
		}, function (err, response, body) {
			debug('DataDog Response', err || body);
		});
	},

	sparkline: function (req, res, next) {
		// Convert to seconds.
		var now = parseInt(Date.now() / 1000);
		var serviceId = req.params.serviceId;
		request.get({
			url: DATADOG_API,
			json: true,
			qs: {
				tags: 'doogie,service_id:' + serviceId,
				end: now,
				start: now - (60 * 60 * 24 * 1) // 5 days
			}
		}, function (err, response) {

			if (err) {
				return res.status(400).send(err);
			}

			// Combine aggregated events.
			var alerts = [];
			response.body.events.forEach(function (event) {
				alerts = alerts.concat(event.children);
			});

			// Sort alerts by descending date.
			alerts.sort(function (a, b) {
				return b.date_happened - a.date_happened;
			});

			// Aggregate data into hourly time slices.
			var aggregatedHourlyData = aggregateData(alerts, 1);

			// Determine percentage of successful checks.
			var results = {
				hourly: averageData(aggregatedHourlyData)
			};

			res.json(err || results);

			function aggregateData(data, timeSlice) {
				if (!data.length) {
					return [];
				}
				timeSlice = timeSlice || 1;
				var slice = timeSlice * 3600;
				var index = 0;
				var aggregates = [];
				aggregates[index] = [];
				var start = data[0].date_happened;
				var end = start - slice;
				debug(end);
				for (var i = 0, l = data.length; i < l; i += 1) {
				  if (data[i].date_happened > end) {
				    aggregates[index].push(data[i]);
				  } else {
				    start = data[i].date_happened;
				    end = start - slice;
				    index += 1;
				    aggregates[index] = [];
				    aggregates[index].push(data[i]);
				  }
				}
				return aggregates;
			}

			function averageData(data) {
				if (!data.length) {
					return [];
				}
				var averaged = [];
				for (var i = 0, l = data.length; i < l; i += 1) {
				  var slice = data[i];
				  var state = 0;
				  for (var j = 0, k = slice.length; j < k; j +=1) {
				    if (slice[j].alert_type !== 'error') {
				      state += 1;
				    }
				  }
				  averaged.push(Math.round((state/slice.length) * 100));
				}
				return averaged;
			}

		});
	}
};
