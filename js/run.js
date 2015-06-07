(function () {
	"use strict";
	
	var container = document.getElementById("solar-system");

	solar.loadApi(function() {
		solar.loadGui(container);
	});
	
})();