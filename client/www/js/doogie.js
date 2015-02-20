angular.module('doogie', [
	'doogie.templates',
	'ngSanitize',
	'ngResource',
	'ngRoute'
]).config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'templates/dashboard.html'
		})
		.when('/admin', {
			templateUrl: 'templates/admin.html'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

/* global jQuery */
(function ($) {
'use strict';

var defaults = {
	days: 5,
	host: '/api/',
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
					// Note: This fails to carry unchanged status through to yesterday.
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

				$td.append('<div class="event level-' + event._status.level + '"><h5><b class="status">' + event._status.name +
					'</b> <small>at ' + formatAMPM(createdAt) + ', <time class="timeago" datetime="' + createdAt.toISOString() + '">' +
					createdAt.getMonth() + '/' + createdAt.getDate() + ' ' + createdAt.getHours() + ':' + createdAt.getMinutes() +
					'</time></small></h5><p class="message">' + event.message + '</p></div>');
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

/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.4.1
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2015, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else if (typeof timestamp === "number") {
      return inWords(new Date(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowPast: true,
      allowFuture: false,
      localeTitle: false,
      cutoff: 0,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        inPast: 'any moment now',
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      }
    },

    inWords: function(distanceMillis) {
      if(!this.settings.allowPast && ! this.settings.allowFuture) {
          throw 'timeago allowPast and allowFuture settings can not both be set to false.';
      }

      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      if(!this.settings.allowPast && distanceMillis >= 0) {
        return this.settings.strings.inPast;
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.round(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || "";
      if ($l.wordSeparator === undefined) { separator = " "; }
      return $.trim([prefix, words, suffix].join(separator));
    },

    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
      return new Date(s);
    },
    datetime: function(elem) {
      var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    },
    isTime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
    }
  });

  // functions that can be called via $(el).timeago('action')
  // init is default when no action is given
  // functions are called with context of a single element
  var functions = {
    init: function(){
      var refresh_el = $.proxy(refresh, this);
      refresh_el();
      var $s = $t.settings;
      if ($s.refreshMillis > 0) {
        this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
      }
    },
    update: function(time){
      var parsedTime = $t.parse(time);
      $(this).data('timeago', { datetime: parsedTime });
      if($t.settings.localeTitle) $(this).attr("title", parsedTime.toLocaleString());
      refresh.apply(this);
    },
    updateFromDOM: function(){
      $(this).data('timeago', { datetime: $t.parse( $t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title") ) });
      refresh.apply(this);
    },
    dispose: function () {
      if (this._timeagoInterval) {
        window.clearInterval(this._timeagoInterval);
        this._timeagoInterval = null;
      }
    }
  };

  $.fn.timeago = function(action, options) {
    var fn = action ? functions[action] : functions.init;
    if(!fn){
      throw new Error("Unknown function name '"+ action +"' for timeago");
    }
    // each over objects here and call the requested function
    this.each(function(){
      fn.call(this, options);
    });
    return this;
  };

  function refresh() {
    //check if it's still visible
    if(!$.contains(document.documentElement,this)){
      //stop if it has been removed
      $(this).timeago("dispose");
      return this;
    }

    var data = prepareData(this);
    var $s = $t.settings;

    if (!isNaN(data.datetime)) {
      if ( $s.cutoff == 0 || Math.abs(distance(data.datetime)) < $s.cutoff) {
        $(this).text(inWords(data.datetime));
      }
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if ($t.settings.localeTitle) {
        element.attr("title", element.data('timeago').datetime.toLocaleString());
      } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}));

/* doogieEvents.js */

/**
* List doogie events and enable editing.
* @example <doogie-events></doogie-events>
*/
angular.module('doogie').directive('doogieBar', function doogieBar() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieBar.html',
		controller: barController,
		controllerAs: 'self'
	};
	return directive;

	function barController(Event, Status, Service) {

		var self = this;

		function refresh() {
			self.events = Event.query();
		}
		refresh();

		self.services = Service.query({
			__sort: 'name'
		});

		self.statuses = Status.query({
			__sort: 'level'
		});

		self.event = {};

		self.create = function (event) {
			new Event(event).$save().then(function () {
				refresh();
				self.event = {};
			});
		};

		self.update = function (event) {
			event.$save().then(refresh);
		};

		self.delete = function (event) {
			event.$delete().then(function () {
				refresh();
			});
		};
	}

});

/* doogieEvents.js */

/**
* List doogie events and enable editing.
* @example <doogie-events></doogie-events>
*/
angular.module('doogie').directive('doogieBoard', ['$timeout', function doogieEvents($timeout) {

	var directive = {
		link: link
	};
	return directive;

	function link(scope, $elem, attrs) {

		var legend = attrs.legend !== 'false';
		$elem.doogieboard({
			legend: legend
		});
	}

}]);

/* doogieServices.js */

/**
* List doogie services and enable editing.
* @example <doogie-services></doogie-services>
*/
angular.module('doogie').directive('doogieChecks', function doogieChecks() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieChecks.html',
		controller: checksController,
		controllerAs: 'self'
	};
	return directive;

	function checksController(Service, Check) {

		var self = this;

		function refresh() {
			self.checks = Check.query();
		}
		refresh();

		self.services = Service.query({
			__sort: 'name'
		});

		self.check = {
			method: 'GET',
			successCode: '^2[0-9][0-9]$',
			successResponseTime: 1000,
			errorResponseTime: 6000
		};

		self.create = function (check) {
			new Check(check).$save().then(function () {
				refresh();
				self.check = {};
			});
		};

		self.update = function (check) {
			check.$save().then(refresh);
		};

		self.delete = function (check) {
			check.$delete().then(function () {
				refresh();
			});
		};
	}

});

/* doogieEvents.js */

/**
* List doogie events and enable editing.
* @example <doogie-events></doogie-events>
*/
angular.module('doogie').directive('doogieEvents', function doogieEvents() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieEvents.html',
		controller: eventsController,
		controllerAs: 'self'
	};
	return directive;

	function eventsController(Event, Status, Service) {

		var self = this;

		function refresh() {
			self.events = Event.query();
		}
		refresh();

		self.services = Service.query({
			__sort: 'name'
		});

		self.statuses = Status.query({
			__sort: 'level'
		});

		self.event = {};

		self.create = function (event) {
			new Event(event).$save().then(function () {
				refresh();
				self.event = {};
			});
		};

		self.update = function (event) {
			event.$save().then(refresh);
		};

		self.delete = function (event) {
			event.$delete().then(function () {
				refresh();
			});
		};
	}

});

/* doogieServices.js */

/**
* List doogie services and enable editing.
* @example <doogie-services></doogie-services>
*/
angular.module('doogie').directive('doogieServices', function doogieServices() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieServices.html',
		controller: servicesController,
		controllerAs: 'self'
	};
	return directive;

	function servicesController(Service) {

		var self = this;

		function refresh() {
			self.services = Service.query();
		}
		refresh();

		self.service = {};

		self.create = function (service) {
			new Service(service).$save().then(function () {
				refresh();
				self.service = {};
			});
		};

		self.update = function (service) {
			service.$save().then(refresh);
		};

		self.delete = function (service) {
			service.$delete().then(function () {
				refresh();
			});
		};
	}

});

/* doogieStatuses.js */

/**
* List doogie statuses and enable editing.
* @example <doogie-statuses></doogie-statuses>
*/
angular.module('doogie').directive('doogieStatuses', function doogieStatuses() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieStatuses.html',
		controller: statusesController,
		controllerAs: 'self'
	};
	return directive;

	function statusesController(Status) {

		var self = this;

		function refresh() {
			self.statuses = Status.query();
		}
		refresh();

		self.status = {};

		self.create = function (status) {
			new Status(status).$save().then(function () {
				refresh();
				self.status = {};
			});
		};

		self.update = function (status) {
			status.$save().then(refresh);
		};

		self.delete = function (status) {
			status.$delete().then(function () {
				refresh();
			});
		};
	}

});

angular.module('doogie').controller('navController', ['$location', function ($location) {
	this.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
}]);

angular.module('doogie')

/**
 * Hosts Service
 */
.factory('Check', ['Resource', function (Resource) {
	return Resource('checks/:_id', {
		_id: '@_id'
	});
}]);

angular.module('doogie')

/**
 * Event Service
 */
.factory('Event', ['Resource', function (Resource) {
	return Resource('events/:_id', {
		_id: '@_id'
	});
}]);

angular.module('doogie')

/**
 * Resource Service
 * http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
 */
.factory('Resource', ['$resource', function ($resource) {
	return function (url, paramDefaults, actions) {

		url = '/api/' + url;

		var defaults = {
			update: {
				method: 'put'
			},
			create: {
				method: 'post'
			}
		};

		actions = angular.extend(defaults, actions);

		var resource = $resource(url, paramDefaults, actions);

		resource.prototype.$save = function (callback) {
			if (this._id) {
				return this.$update(callback);
			} else {
				return this.$create(callback);
			}
		};

		return resource;
	};
}]);

angular.module('doogie')

/**
 * Services Service
 */
.factory('Service', ['Resource', function (Resource) {
	return Resource('services/:_id', {
		_id: '@_id'
	});
}]);

angular.module('doogie')

/**
 * Status Service
 */
.factory('Status', ['Resource', function (Resource) {
	return Resource('statuses/:_id', {
		_id: '@_id'
	});
}]);

angular.module("doogie.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/admin.html","<doogie-events></doogie-events>\n<doogie-checks></doogie-checks>\n<doogie-services></doogie-services>\n<doogie-statuses></doogie-statuses>\n");
$templateCache.put("templates/dashboard.html","<doogie-board legend=\"false\"></doogie-board>\n");
$templateCache.put("templates/doogieBar.html","<form class=\"navbar-form navbar-left\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"self.event.message\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n  	<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"self.create(self.event)\">Send</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieChecks.html","<h2>Checks</h2>\n<form class=\"form-inline\" ng-repeat=\"check in self.checks | orderBy: \'url\'\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"check._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"check.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"http://www.yourcheck.com\" ng-model=\"check.url\">\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"check.method\">\n      <option value=\"GET\">GET</option>\n      <option value=\"POST\">POST</option>\n      <option value=\"PUT\">PUT</option>\n      <option value=\"DELETE\">DELETE</option>\n    </select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"check.successCode\" size=\"6\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"check.successResponseTime\" size=\"4\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"check.errorResponseTime\" size=\"4\">\n  </div>\n  <div class=\"form-group\">\n	  <button class=\"btn btn-default\" ng-click=\"self.update(check)\">Save</button>\n	  <button class=\"btn btn-danger\" ng-click=\"self.delete(check)\">Delete</button>\n  </div>\n</form>\n\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.check._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.check.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"http://www.yourcheck.com\" ng-model=\"self.check.url\">\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.check.method\">\n      <option value=\"GET\">GET</option>\n      <option value=\"POST\">POST</option>\n      <option value=\"PUT\">PUT</option>\n      <option value=\"DELETE\">DELETE</option>\n    </select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.successCode\" size=\"6\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.successResponseTime\" size=\"4\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.errorResponseTime\" size=\"4\">\n  </div>\n  <div class=\"form-group\">\n  	<button class=\"btn btn-primary\" ng-click=\"self.create(self.check)\">Add</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieEvents.html","<h2>Events</h2>\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"self.event.message\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n  	<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"self.create(self.event)\">Send</button>\n  </div>\n</form>\n<form class=\"form-inline\" ng-repeat=\"event in self.events | orderBy : \'createdAt\' : true \">\n	<div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"event.message\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n	  <button type=\"submit\" class=\"btn btn-default\" ng-click=\"self.update(event)\">Save</button>\n	  <button type=\"submit\" class=\"btn btn-danger\" ng-click=\"self.delete(event)\">Delete</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieServices.html","<h2>Services</h2>\n\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.service.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"self.service.description\" size=\"40\">\n  </div>\n  <div class=\"form-group\">\n    <button class=\"btn btn-primary\" ng-click=\"self.create(self.service)\">Add</button>\n  </div>\n</form>\n\n<form class=\"form-inline\" ng-repeat=\"service in self.services | orderBy: \'name\'\">\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"service.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"service.description\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n	  <button class=\"btn btn-default\" ng-click=\"self.update(service)\">Save</button>\n	  <button class=\"btn btn-danger\" ng-click=\"self.delete(service)\">Delete</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieStatuses.html","<h2>Statuses</h2>\n\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.status.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"self.status.description\" size=\"50\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"0\" ng-model=\"self.status.level\" size=\"2\">\n  </div>\n  <div class=\"form-group\">\n    <button class=\"btn btn-primary\" ng-click=\"self.create(self.status)\">Add</button>\n  </div>\n</form>\n\n<form class=\"form-inline\" ng-repeat=\"status in self.statuses | orderBy : \'level\'\">\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"status.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"status.description\" size=\"50\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"0\" ng-model=\"status.level\" size=\"2\">\n  </div>\n  <div class=\"form-group\">\n	  <button class=\"btn btn-default\" ng-click=\"self.update(status)\">Save</button>\n	  <button class=\"btn btn-danger\" ng-click=\"self.delete(status)\">Delete</button>\n  </div>\n</form>\n");}]);