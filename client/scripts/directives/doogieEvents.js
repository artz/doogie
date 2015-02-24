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
