angular.module('doogie', [
	'doogie.templates',
	'ngSanitize',
	'ngResource',
	'ngRoute'
]).config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'templates/dashboard.html'
		})
		.when('/admin', {
			templateUrl: 'templates/admin.html'
		})
		.otherwise({
			redirectTo: '/'
		});
});
