/* doogieEvents.js */

/**
* List doogie events and enable editing.
* @example <doogie-events></doogie-events>
*/
angular.module('doogie').directive('doogieBoard', function doogieEvents($timeout) {

	var directive = {
		link: link
	};
	return directive;

	function link(scope, $elem, attrs) {

		var legend = attrs.legend !== 'false';
		$elem.doogieboard({
			legend: legend
		});
	}

});
