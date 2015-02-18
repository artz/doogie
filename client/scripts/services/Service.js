angular.module('doogie')

/**
 * Services Service
 */
.factory('Service', function (Resource) {
	return Resource('services/:_id', {
		_id: '@_id'
	});
});
