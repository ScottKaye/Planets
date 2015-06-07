(function () {
	"use strict";

	var _planets = [];
	var $planet = $("#planet");
	var $planetList = $("#planet-list");
	var $planetName = $("#planet-name");

	solar.load(function (planets) {
		_planets = planets;
		//Loaded planets.length planets
		planets.forEach(function (p) {
			$planetList
				.append(
					$("<li></li>")
					.append(
						$("<a></a>")
						.text(p.name)
						.attr("href", "#" + p.name)
						.on("click", clickPlanet)
					)
				);
		});

		if (window.location.hash) {
			var viewing = window.location.hash.substring(1);
			var planet = getPlanetByName(viewing);
			viewPlanet(planet);
		}
	});

	function getPlanetByName(name) {
		return _planets.filter(function (p) {
			return p.name === name;
		})[0];
	}

	function clickPlanet(evt) {
		var planet = getPlanetByName(evt.toElement.innerHTML);
		viewPlanet(planet);
	}
	
	function viewPlanet(planet) {
		$planetList.children().removeClass("current");
		$planetList.find("a[href=#" + planet.name + "]").parent("li").addClass("current");
		$planet.css("background-color", planet.color);
		$planetName.text(planet.name);
	}
})();