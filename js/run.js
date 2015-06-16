(function () {
	"use strict";
	var container = document.getElementById("solar-system");

	solar.loadApi(function() {
		//Create solar system
		solar.loadGui(container);
		
		//Load each planet into sidebar
		var $side = $("#side");
		solar.planets.forEach(function(p) {
			$side.append(
				$("<div></div>")
				.append(solar.planetTable(p)));
		});
	});
})();