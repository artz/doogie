angular.module('doogie')

/**
 * Event Service
 */
.factory('Event', function (Resource) {
	return Resource('events/:_id', {
		_id: '@_id'
	});
});
