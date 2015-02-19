angular.module('doogie')

/**
 * Hosts Service
 */
.factory('Check', function (Resource) {
	return Resource('checks/:_id', {
		_id: '@_id'
	});
});
