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
