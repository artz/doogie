angular.module('doogie')

/**
 * Resource Service
 * http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
 */
.factory('Resource', function ($resource) {
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
});
