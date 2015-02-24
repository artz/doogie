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
