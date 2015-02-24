/* global jQuery */
(function ($) {
'use strict';

var defaults = {
	days: 5,
	host: 'http://doogie.amp.aol.com/api/',
	// host: '/api/',
	// legend: true,
	sparkline: {
		disableInteraction: true,
		width: 62,
		height: 20,
		lineWidth: 1,
		lineColor: '#6b6b6b',
		fillColor: '#f5f5f5',
		chartRangeMin: 0,
		chartRangeMax: 100,
		spotColor: false,
		minSpotColor: false,
		maxSpotColor: false
	}
};

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	return hours + ':' + minutes + ampm;
}

$.fn.doogieboard = function doogieBoard(options) {

	var isTimeago = !!jQuery.timeago;

	options = options || {};
	options = $.extend({}, defaults, options);

	if (isNaN(options.days) || options.days < 1) {
		options.days = defaults.days;
	}

	// Fetch event data.
	// TODO: Limit to days set in options.
	var eventPromise = $.get(options.host + 'events', {
		__populate: '_status _service',
		__sort: '-createdAt'
	});
	var servicePromise = $.get(options.host + 'services', {
		__populate: '_lastStatus',
		__sort: 'name'
	});
	var statusPromise = $.get(options.host + 'statuses', {
		__sort: 'level'
	});

	this.each(function (index, elem) {

		var days = options.days;

		var $elem = $(elem).addClass('doogieboard');
		var $table = $('<table class="table"></table>');
		var $thead = $('<thead></thead>');
		var $tr = $('<tr></tr>');
		var $tbody = $('<tbody></tbody>');

		// Render table header.
		$tr.append('<th>Service</th>');
		for (var i = 0, l = days; i < l; i += 1) {
			var text;
			if (i === 0) {
				text = 'Today';
			} else if (i === 1) {
				text = 'Yesterday';
			} else {
				text = i + ' days ago';
			}
			$tr.append('<th>' + text + '</th>');
		}
		$thead.append($tr);

		// Render data table.
		$.when(eventPromise, servicePromise, statusPromise).done(function (events, services, statuses) {

			// Store DOM nodes for fast retrieval.
			var hash = {};

			// Find and set default status.
			var level0Status;
			statuses = statuses[0];
			for (var i = 0, l = statuses.length; i < l; i += 1) {
				if (statuses[i].level === 0) {
					level0Status = statuses[i];
					console.log('Setting level0Status:', level0Status);
					break;
				}
			}
			if (!level0Status) {
				console.log('Doogieboard Error: Please configure a level 0 status.');
			}

			// Render service names.
			services = services[0];
			for (var i = 0, l = services.length; i < l; i += 1) {

				var date = new Date();
				var service = services[i];
				hash[service._id] = {};

				var $tr = $('<tr></tr>');
				$tr.append('<td class="doogieboard-service-name" data-service-id="' + service._id + '"><b>' + service.name + '</b></td>');

				for (var j = 0, k = days; j < k; j += 1) {

					var $td = $('<td class="doogieboard-day daysago-' + j +
						'"><span class="doogieboard-badge"><b class="event-count"></b><i class="event-status">' + level0Status.name + '</i></span></td>');

					$td.data('eventCount', 0);
					$td.data('date', date.toISOString());
					hash[service._id][date.getMonth() + '-' + date.getDate()] = $td;
					$tr.append($td);
					date.setDate(date.getDate() - 1);

					// Populate current status on first cell.
					// Note: This fails to carry unchanged status through to yesterday.
					if (j === 0 && service._lastStatus) {
						$td.addClass('level-' + service._lastStatus.level);
						$td.find('.event-status').html(service._lastStatus.name);
					}
				}

				$tbody.append($tr);
			}

			events = events[0];
			for (var i = 0, l = events.length, event; i < l; i += 1) {
				event = events[i];
				var createdAt = new Date(event.createdAt);
				var $td = hash[event._service._id][createdAt.getMonth() + '-' + createdAt.getDate()];

				// TODO: Find out why this is empty sometimes.
				if ($td) {
					if (!$td.data('hasEvents')) {
						$td.data('hasEvents', true);
						$td.addClass('doogieboard-events');
						$td.addClass('level-' + event._status.level);
						$td.find('.event-status').html(event._status.name);
					}

					var eventCount = $td.data('eventCount') + 1;
					$td.data('eventCount', eventCount);
					$td.find('.event-count').html(eventCount);

					$td.append('<div class="event level-' + event._status.level + '"><h5><b class="status">' + event._status.name +
						'</b> <small>at ' + formatAMPM(createdAt) + ', <time class="timeago" datetime="' + createdAt.toISOString() + '">' +
						createdAt.getMonth() + '/' + createdAt.getDate() + ' ' + createdAt.getHours() + ':' + createdAt.getMinutes() +
						'</time></small></h5><p class="message">' + event.message + '</p></div>');
				}

			}

			// Update DOM.
			$table.append($thead);
			$table.append($tbody);
			$elem.append($table);
			$elem.trigger('doogieboard-ready');

			if (options.legend) {
				statuses = statuses[0];
				var $legend = $('<ul class="status-list"></ul>');
				for (var i = 0, l = statuses.length; i < l; i += 1) {
					var status = statuses[i];
					$legend.append('<li class="status-item level-' + status.level + '"><b>' + status.name + '</b> <i>' + status.description + '</li>');
				}
				$legend.wrap('<div class="legend"></div>');
				$legend.prepend('<h2>Status Legend</h2>');
				$elem.append($legend);
			}

			if (isTimeago) {
				$elem.find('.timeago').timeago();
			}

			if (options.sparkline) {
				$table.find('.doogieboard-service-name').each(function () {
					var $td = $(this);
					var serviceId = $td.data('serviceId');
					$.get(options.host + 'services/' + serviceId + '/sparkline', function (data) {
						if (data.hourly && data.hourly.length) {
							var $sparkline = $('<span class="doogieboard-sparkline"></span>');
							$td.append($sparkline);
							$sparkline.sparkline(data.hourly, options.sparkline);
						}
					});
				});
			}

			var $activeDay;
			var $activeInfo;
			$elem.on('click', 'td.doogieboard-events', function () {
				var $td = $(this);
				if ($activeDay) {
					$activeDay.removeClass('events-open active');
					$activeInfo.remove();
					if ($activeDay[0] === $td[0]) {
						$activeDay = $activeInfo = undefined;
						return;
					}
				}

				$td.addClass('events-open active');
				$activeDay = $td;
				var $tr = $td.parent();
				var date = new Date($td.data('date'));
				date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
				$activeInfo = $('<tr class="doogieboard-info active"><td><span class="date">' + date + '</span></td><td colspan="' + days + '">' + $td.html() + '</td></tr>');
				$tr.after($activeInfo);

			});
		});
	});
};

})(jQuery);
