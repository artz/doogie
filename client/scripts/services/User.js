angular.module('doogie')

/**
 * Users Service
 */
.factory('User', function (Resource) {
	return Resource('users/:_id', {
		_id: '@_id'
	});
});
