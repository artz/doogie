angular.module('doogie')

/**
 * Status Service
 */
.factory('Status', function (Resource) {
	return Resource('statuses/:_id', {
		_id: '@_id'
	});
});
