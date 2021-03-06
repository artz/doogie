var request = require('request');
var debug = require('debug')('doogie');
var app = require('express')();
var url = require('url');
var env = app.get('env').toLowerCase();
var config = require('../config')[env];
var Cache = require('node-cache');
var sparklineCache = new Cache({
	stdTTL: 60 * 15, // 15 minutes
	checkperiod: 60 * 5 // 5 minutes
});

module.exports = {
	alert: function datadogAlert(alert) {

		// POST to DataDog events API.
		// http://docs.datadoghq.com/guides/logs/
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

		// debug('DataDog Request', payload);
		request.post({
			url: config.datadog.api,
			json: true,
			body: payload
		}, function (err, response, body) {
			// debug('DataDog Response', err || body);
		});
	},

	sparkline: function (req, res, next) {

		var serviceId = req.params.serviceId;
		var results = sparklineCache.get(serviceId);
		if (results[serviceId]) {
			return res.json(results[serviceId]);
		}
		var now = parseInt(Date.now() / 1000); // Convert to seconds.
		request.get({
			url: config.datadog.api,
			json: true,
			qs: {
				tags: ('doogie,env:' + app.get('env') + ',service_id:' + serviceId).toLowerCase(),
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
			results = {
				hourly: averageData(aggregatedHourlyData)
			};

			sparklineCache.set(serviceId, results);
			res.json(results);

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
