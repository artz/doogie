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
