/* global jQuery */
(function ($) {
'use strict';

var defaults = {
	days: 5,
	host: 'http://localhost:3001/api/',
	legend: true
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
		var $thead = $('<thead><tr></tr></thead>');
		var $tbody = $('<tbody></tbody>');

		// Render table header.
		$thead.append('<th>Service</th>');
		for (var i = 0, l = days; i < l; i += 1) {
			var text;
			if (i === 0) {
				text = 'Today';
			} else if (i === 1) {
				text = 'Yesterday';
			} else {
				text = i + ' days ago';
			}
			$thead.append('<th>' + text + '</th>');
		}

		// Render data table.
		$.when(eventPromise, servicePromise, statusPromise).done(function (events, services, statuses) {

			// Store DOM nodes for fast retrieval.
			var hash = {};

			services = services[0];
			for (var i = 0, l = services.length; i < l; i += 1) {

				var date = new Date();
				var service = services[i];
				hash[service._id] = {};

				var $tr = $('<tr></tr>');
				$tr.append('<td class="service-name">' + service.name + '</td>');

				for (var j = 0, k = days; j < k; j += 1) {
					var $td = $('<td class="doogieboard-day daysago-' + j + '"><span class="doogieboard-badge"><b class="event-count"></b></span></td>');
					$td.data('eventCount', 0);
					$td.data('date', date);
					hash[service._id][date.getMonth() + '-' + date.getDate()] = $td;
					$tr.append($td);
					date.setDate(date.getDate() - 1);

					// Populate current status on first cell.
					if (j === 0 && service._lastStatus) {
						$td.addClass('level-' + service._lastStatus.level);
					}
				}

				$tbody.append($tr);
			}

			events = events[0];
			for (var i = 0, l = events.length, event; i < l; i += 1) {
				event = events[i];
				var createdAt = new Date(event.createdAt);
				var $td = hash[event._service._id][createdAt.getMonth() + '-' + createdAt.getDate()];

				if (!$td.data('hasEvents')) {
					$td.data('hasEvents', true);
					$td.addClass('doogieboard-events');
					$td.addClass('level-' + event._status.level);
				}

				var eventCount = $td.data('eventCount') + 1;
				$td.data('eventCount', eventCount);
				$td.find('.event-count').html(eventCount);

				$td.append('<div class="event"><b class="status">' + event._status.name + '</b> at ' + formatAMPM(createdAt) + ', <time class="timeago" datetime="' + createdAt.toISOString() + '">' +
					createdAt.getMonth() + '/' + createdAt.getDate() + ' ' + createdAt.getHours() + ':' + createdAt.getMinutes() +
					'</time>.<p>' + event.message + '</p></div>');
			}

			// Update DOM.
			$table.append($thead);
			$table.append($tbody);
			$elem.append($table);

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
				var date = $td.data('date');
				date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
				$activeInfo = $('<tr class="doogieboard-info active"><td><span class="date">' + date + '</span></td><td colspan="' + days + '">' + $td.html() + '</td></tr>');
				$tr.after($activeInfo);

			});

		});

	});
};

})(jQuery);
