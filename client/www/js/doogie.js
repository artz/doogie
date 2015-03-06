angular.module('doogie', [
	'doogie.templates',
	'ngSanitize',
	'ngResource',
	'ngRoute'
]).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	// $locationProvider.html5Mode(true);
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

angular.module('doogie').controller('navController', ['$location', 'Auth', function ($location, Auth) {

	this.user = Auth.user;

	this.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};

}]);

/* doogieEvents.js */

/**
* List doogie events and enable editing.
* @example <doogie-events></doogie-events>
*/
angular.module('doogie').directive('doogieBar', function doogieBar() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieBar.html',
		controller: ['Event', 'Status', 'Service', function barController(Event, Status, Service) {

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
		}],
		controllerAs: 'self'
	};
	return directive;


});

/* doogieEvents.js */

/**
* List doogie events and enable editing.
* @example <doogie-events></doogie-events>
*/
angular.module('doogie').directive('doogieBoard', function () {

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

});

/* doogieServices.js */

/**
* List doogie services and enable editing.
* @example <doogie-services></doogie-services>
*/
angular.module('doogie').directive('doogieChecks', function doogieChecks() {

	function encodeHeaders(headers) {
		var result = {};
		headers.split('\n').forEach(function(header) {
			header = header.split(':');
			if (headers[0]) {
				var key = header[0].trim();
			}
			if (key && headers[1]) {
				var value = header[1].trim();
				result[key] = value;
			}
		});
		return result;
	}

	function decodeHeaders(headers) {
		var result = '';
		for (var key in headers) {
			result += key + ':' + headers[key] + '\n';
		}
		return result;
	}

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieChecks.html',
		controller: ['Service', 'Check', function checksController(Service, Check) {
			var self = this;

			function refresh() {
				Check.query().$promise.then(function (checks) {
					self.checks = checks.map(function (check) {
						check.headers = decodeHeaders(check.headers);
						return check;
					});
				});
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
				check.headers = encodeHeaders(check.headers);
				new Check(check).$save().then(function () {
					refresh();
					self.check = {};
				});
			};

			self.update = function (check) {
				check.headers = encodeHeaders(check.headers);
				check.$save().then(refresh);
			};

			self.delete = function (check) {
				check.$delete().then(function () {
					refresh();
				});
			};
		}],
		controllerAs: 'self'
	};
	return directive;



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
		controller: ['Event', 'Status', 'Service', function eventsController(Event, Status, Service) {

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
		}],
		controllerAs: 'self'
	};
	return directive;



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
		controller: ['Service', function servicesController(Service) {

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
		}],
		controllerAs: 'self'
	};
	return directive;


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
		controller: ['Status', function statusesController(Status) {

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
		}],
		controllerAs: 'self'
	};
	return directive;


});

/* doogieUsers.js */

/**
* List doogie users and enable editing.
* @example <doogie-users></doogie-users>
*/
angular.module('doogie').directive('doogieUsers', function doogieUsers() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieUsers.html',
		controller: ['User', 'Auth', function usersController(User, Auth) {

			var self = this;
			var me = Auth.user;

			function refresh() {
				self.users = User.query();
			}
			refresh();

			self.toggleAdmin = function (user) {
				// console.log(me);
				if (user.roles) {
					var index = user.roles.indexOf('admin');
					if (index === -1) {
						user.roles.push('admin');
					} else {
						user.roles.splice(index, 1);
					}
				} else {
					user.roles = ['admin'];
				}
				user.$save().then(refresh);
			};

			self.delete = function (user) {
				user.$delete().then(function () {
					refresh();
				});
			};
		}],
		controllerAs: 'self'
	};
	return directive;

});

angular.module("doogie.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/admin.html","<doogie-events></doogie-events>\n<doogie-checks></doogie-checks>\n<doogie-services></doogie-services>\n<doogie-statuses></doogie-statuses>\n<doogie-users></doogie-users>\n");
$templateCache.put("templates/dashboard.html","<doogie-board legend=\"false\"></doogie-board>\n");
$templateCache.put("templates/doogieBar.html","<form class=\"navbar-form navbar-left\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"self.event.message\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n  	<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"self.create(self.event)\">Send</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieChecks.html","<h2>Checks</h2>\n\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.check._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.check.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"http://www.yourcheck.com\" ng-model=\"self.check.url\">\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.check.method\">\n      <option value=\"GET\">GET</option>\n      <option value=\"POST\">POST</option>\n      <option value=\"PUT\">PUT</option>\n      <option value=\"DELETE\">DELETE</option>\n    </select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.successCode\" size=\"6\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.successResponseTime\" size=\"4\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.errorResponseTime\" size=\"4\">\n  </div>\n  <div class=\"form-group\">\n    <textarea type=\"text\" ng-model=\"self.check.headers\"></textarea>\n  </div>\n  <!--<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.names[0]\" size=\"10\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.headers[self.names[0]]\" size=\"10\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.names[1]\" size=\"10\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"self.check.headers[self.names[1]]\" size=\"10\">\n  </div>-->\n  <div class=\"form-group\">\n    <button class=\"btn btn-primary\" ng-click=\"self.create(self.check)\">Add</button>\n  </div>\n</form>\n\n<form class=\"form-inline\" ng-repeat=\"check in self.checks\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"check._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"check.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"http://www.yourcheck.com\" ng-model=\"check.url\">\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"check.method\">\n      <option value=\"GET\">GET</option>\n      <option value=\"POST\">POST</option>\n      <option value=\"PUT\">PUT</option>\n      <option value=\"DELETE\">DELETE</option>\n    </select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"check.successCode\" size=\"6\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"check.successResponseTime\" size=\"4\">\n    <input type=\"text\" class=\"form-control\" ng-model=\"check.errorResponseTime\" size=\"4\">\n  </div>\n  <div class=\"form-group\">\n    <textarea type=\"text\" ng-model=\"check.headers\"></textarea>\n  </div>\n  <div class=\"form-group\">\n	  <button class=\"btn btn-default\" ng-click=\"self.update(check)\">Save</button>\n	  <button class=\"btn btn-danger\" ng-click=\"self.delete(check)\">Delete</button>\n  </div>\n</form>\n\n");
$templateCache.put("templates/doogieEvents.html","<h2>Events</h2>\n\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"self.event.message\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n  	<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"self.create(self.event)\">Send</button>\n  </div>\n</form>\n<form class=\"form-inline\" ng-repeat=\"event in self.events\">\n	<div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"event.message\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n	  <button type=\"submit\" class=\"btn btn-default\" ng-click=\"self.update(event)\">Save</button>\n	  <button type=\"submit\" class=\"btn btn-danger\" ng-click=\"self.delete(event)\">Delete</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieServices.html","<h2>Services</h2>\n\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.service.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"self.service.description\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n    <button class=\"btn btn-primary\" ng-click=\"self.create(self.service)\">Add</button>\n  </div>\n</form>\n\n<form class=\"form-inline\" ng-repeat=\"service in self.services\">\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"service.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"service.description\" size=\"60\">\n  </div>\n  <div class=\"form-group\">\n	  <button class=\"btn btn-default\" ng-click=\"self.update(service)\">Save</button>\n	  <button class=\"btn btn-danger\" ng-click=\"self.delete(service)\">Delete</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieStatuses.html","<h2>Statuses</h2>\n\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.status.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"self.status.description\" size=\"52\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"0\" ng-model=\"self.status.level\" size=\"2\">\n  </div>\n  <div class=\"form-group\">\n    <button class=\"btn btn-primary\" ng-click=\"self.create(self.status)\">Add</button>\n  </div>\n</form>\n\n<form class=\"form-inline\" ng-repeat=\"status in self.statuses\">\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"status.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"status.description\" size=\"52\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"0\" ng-model=\"status.level\" size=\"2\">\n  </div>\n  <div class=\"form-group\">\n	  <button class=\"btn btn-default\" ng-click=\"self.update(status)\">Save</button>\n	  <button class=\"btn btn-danger\" ng-click=\"self.delete(status)\">Delete</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieUsers.html","<h2>Users</h2>\n\n<form class=\"form-inline\" ng-repeat=\"user in self.users\">\n	<div class=\"form-group\">\n    <b>{{ user.displayName }}</b> (@{{ user.username }})\n  </div>\n  <div class=\"checkbox\">\n    <label><input type=\"checkbox\" ng-checked=\"user.roles.indexOf(\'admin\') !== -1\" ng-click=\"self.toggleAdmin(user)\"> Admin</label>\n  </div>\n  <!--<div class=\"form-group\">\n	  <button class=\"btn btn-danger\" ng-click=\"self.delete(user)\">Delete</button>\n  </div>-->\n</form>\n");}]);
angular.module('doogie')

/**
 * Auth Service
 */
.factory('Auth', ['$http', function ($http) {

	var promise;
	user();

	function user() {
		promise = $http.get('/auth/user').success(function (user) {
			angular.extend(promise, user);
		}).finally(function () {
			promise.$resolved = true;
		});
		promise.$resolved = false;
		return promise;
	}

	var auth = {
		user: promise
	};

	return auth;

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

angular.module('doogie')

/**
 * Users Service
 */
.factory('User', ['Resource', function (Resource) {
	return Resource('users/:_id', {
		_id: '@_id'
	});
}]);
