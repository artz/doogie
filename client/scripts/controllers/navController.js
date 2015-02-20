angular.module('doogie').controller('navController', function ($location) {
	this.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
});
