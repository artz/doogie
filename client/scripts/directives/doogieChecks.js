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

		self.check = {};

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
