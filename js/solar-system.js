(function (solar, undefined) {
	"use strict";

	//Private vars

	var _status = {
		loaded: false
	};

	var _uuids = []; //List of generated UUIDs
	var _planets = [];

	//Private methods

	function loadPlanet(node) {
		var props = {
			color: $(node).attr("COLOR"),
			name: $(node).find("> NAME").text(),
			distance: $(node).find("> DISTANCE").text(),
			radius: $(node).find("> RADIUS").text(),
			length_of_year: $(node).find("> LENGTH_OF_YEAR").text(),
			day: $(node).find("> DAY").text(),
			mass: $(node).find("> MASS").text(),
			density: $(node).find("> DENSITY").text(),
			satellites: loadSatellites($(node).find("> SATELLITES").children()),
		};
		_planets.push(props);
	}

	function loadSatellites(node) {
		if (node.length) {
			var satellites = [];
			for (var i = 0, len = node.length; i < len; i++) {
				satellites.push({
					name: $(node[i]).find("> NAME").text(),
					distance_from_planet: $(node[i]).find("> DISTANCE_FROM_PLANET").text(),
					orbit: $(node[i]).find("> ORBIT").text(),
				});
			}
			return satellites;
		}
		return null;
	}

	function toNaturalLanguage(string) {
		string = "" + string.toLowerCase();
		var lowercase = ["of", "a", "to"];
		var i, len;

		if (string) {
			//Is it a number?
			if (parseInt(string) == string) {
				if (parseInt(string) >= 10000) {
					string = string.split("");
					//Add commas
					for (i = string.length - 1; i >= 0; i -= 3) {
						if (i < string.length - 1)
							string[i] = string[i] + ",";
					}
					string = string.join("");
				}
			} else {
				//Capitalize first letter
				string = string.split("");
				string[0] = string[0].toUpperCase();

				//Split underscores into spaces
				for (i = 0, len = string.length; i < len; i++) {
					if (string[i] == "_") {
						string[i] = " ";
						if (string[i + 1]) {
							string[i + 1] = string[i + 1].toUpperCase();
						}
					}
				}

				string = string.join("");

				//Lowercase replacements
				for (i = 0, len = lowercase.length; i < len; i++) {
					var expr = new RegExp(lowercase[i], "gi");
					string = string.replace(expr, lowercase[i]);
				}
			}
		}
		return string;
	}

	function planetTable(planet) {
		var table = $("<table></table>");
		for (var prop in planet) {
			var val = (planet[prop]);

			switch (typeof planet[prop]) {
			case "string":
				prop = toNaturalLanguage(prop);
				var row = $("<tr></tr>")
					.append(
						$("<td></td>")
						.text(prop)
					)
					.append(
						$("<td></td>")
						.text(toNaturalLanguage(val))
					);
				$(table).append(row);
				break;
			default:
				if (val && val.length) {
					for(var subprop in val) {
						console.log(subprop, val[subprop]);
					}
				}
				break;
			}
		}
		return table;
	}

	function load(callback) {
		//Download planets.xml
		$.ajax({
			url: "res/planets.xml",
			method: "get",
			dataType: "xml",
			success: function (data) {
				//Enter solar system
				var planets = $(data).find("SOLAR_SYSTEM > PLANETS").children();
				//Load each planet into _planets
				for (var i = 0, len = planets.length; i < len; loadPlanet(planets[i++]));
				_status.loaded = true;

				if (typeof callback === "function") callback(_planets);
			}
		});
	}

	function createPlanet(planet) {
		return $("<figure></figure>")
			.addClass("planet")
			.css({
				background: planet.color,
			})
			.data("planet", planet)
			.append(
				$("<figcaption></figcaption>")
				.append(
					$("<h1></h1>")
					.text(planet.name)
				)
				.append(planetTable(planet))
			);
	}

	function reset() {
		_uuids = [];
		_planets = [];
		_status.loaded = false;
	}

	//Public methods

	solar.load = function (callback) {
		//Reset if needed
		if (_status.loaded) reset();

		load(callback);
	};

	solar.createPlanet = function (planet) {
		return createPlanet(planet);
	}

}(window.solar = window.solar || {}));