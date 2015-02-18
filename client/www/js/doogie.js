angular.module('doogie', [
	'doogie.templates',
	'ngResource'
]);

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

angular.module("doogie.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/doogieEvents.html","<h2>Events</h2>\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"self.event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"self.event.message\">\n  </div>\n  <div class=\"form-group\">\n  	<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"self.create(self.event)\">Send</button>\n  </div>\n</form>\n<form class=\"form-inline\" ng-repeat=\"event in self.events | orderBy : \'createdAt\' : true \">\n	<div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"event._service\" ng-options=\"service._id as service.name for service in self.services\"></select>\n  </div>\n  <div class=\"form-group\">\n    <select class=\"form-control\" ng-model=\"event._status\" ng-options=\"status._id as status.name for status in self.statuses\"></select>\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Message\" ng-model=\"event.message\">\n  </div>\n  <div class=\"form-group\">\n	  <button type=\"submit\" class=\"btn btn-default\" ng-click=\"self.update(event)\">Save</button>\n	  <button type=\"submit\" class=\"btn btn-danger\" ng-click=\"self.delete(event)\">Delete</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieServices.html","<h2>Services</h2>\n<form class=\"form-inline\" ng-repeat=\"service in self.services | orderBy: \'name\'\">\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"service.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"service.description\">\n  </div>\n  <div class=\"form-group\">\n	  <button type=\"submit\" class=\"btn btn-default\" ng-click=\"self.update(service)\">Save</button>\n	  <button type=\"submit\" class=\"btn btn-danger\" ng-click=\"self.delete(service)\">Delete</button>\n  </div>\n</form>\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.service.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"self.service.description\">\n  </div>\n  <div class=\"form-group\">\n  	<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"self.create(self.service)\">Add</button>\n  </div>\n</form>\n");
$templateCache.put("templates/doogieStatuses.html","<h2>Statuses</h2>\n<form class=\"form-inline\" ng-repeat=\"status in self.statuses | orderBy : \'level\'\">\n	<div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"status.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"status.description\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"number\" class=\"form-control\" placeholder=\"0\" ng-model=\"status.level\">\n  </div>\n  <div class=\"form-group\">\n	  <button type=\"submit\" class=\"btn btn-default\" ng-click=\"self.update(status)\">Save</button>\n	  <button type=\"submit\" class=\"btn btn-danger\" ng-click=\"self.delete(status)\">Delete</button>\n  </div>\n</form>\n<form class=\"form-inline\">\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"self.status.name\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"self.status.description\">\n  </div>\n  <div class=\"form-group\">\n    <input type=\"number\" class=\"form-control\" placeholder=\"0\" ng-model=\"self.status.level\">\n  </div>\n  <div class=\"form-group\">\n  	<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"self.create(self.status)\">Add</button>\n  </div>\n</form>\n\n");}]);