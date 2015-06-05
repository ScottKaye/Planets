(function () {
	"use strict";
	
	solar.load(function (planets) {
		//Loaded planets.length planets
		planets.forEach(function (p) {
			var el = solar.createPlanet(p);
			$("section.solar-system").append(el);
		});
	});
})();