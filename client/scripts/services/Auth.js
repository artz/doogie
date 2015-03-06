angular.module('doogie')

/**
 * Auth Service
 */
.factory('Auth', function ($http) {

	var promise;
	user();

	function user() {
		promise = $http.get('/auth/user').success(function (user) {
			angular.extend(promise, user);
		}).finally(function () {
			promise.$resolved = true;
		});
		promise.$resolved = false;
		return promise;
	}

	var auth = {
		user: promise
	};

	return auth;

});
