angular.module('doogie').controller('navController', function ($location, Auth) {

	this.user = Auth.user;

	this.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};

});
