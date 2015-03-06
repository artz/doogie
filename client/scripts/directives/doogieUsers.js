/* doogieUsers.js */

/**
* List doogie users and enable editing.
* @example <doogie-users></doogie-users>
*/
angular.module('doogie').directive('doogieUsers', function doogieUsers() {

	var directive = {
		scope: {},
		templateUrl: 'templates/doogieUsers.html',
		controller: ['User', 'Auth', function usersController(User, Auth) {

			var self = this;
			var me = Auth.user;

			function refresh() {
				self.users = User.query();
			}
			refresh();

			self.toggleAdmin = function (user) {
				// console.log(me);
				if (user.roles) {
					var index = user.roles.indexOf('admin');
					if (index === -1) {
						user.roles.push('admin');
					} else {
						user.roles.splice(index, 1);
					}
				} else {
					user.roles = ['admin'];
				}
				user.$save().then(refresh);
			};

			self.delete = function (user) {
				user.$delete().then(function () {
					refresh();
				});
			};
		}],
		controllerAs: 'self'
	};
	return directive;

});
