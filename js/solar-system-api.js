(function (solar, undefined) {
	"use strict";

	//Public vars
	
	solar.status = solar.status || {};
	solar.status.loaded = false;
	
	solar.planets = solar.planets || [];

	//Private methods
	
	function loadPlanet(node) {
		var props = {
			color: $(node).attr("COLOR"),
			name: $(node).find("> NAME").text(),
			distance: parseFloat($(node).find("> DISTANCE").text()),
			radius: parseFloat($(node).find("> RADIUS").text()),
			length_of_year: $(node).find("> LENGTH_OF_YEAR").text(),
			day: parseFloat($(node).find("> DAY").text()),
			mass: parseFloat($(node).find("> MASS").text()),
			density: parseFloat($(node).find("> DENSITY").text()),
			satellites: loadSatellites($(node).find("> SATELLITES").children()),
		};
		props.orbit_time = props.length_of_year * 365;
		solar.planets.push(props);
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

	function loadApi(callback) {
		//Download planets.xml
		$.ajax({
			url: "res/planets.xml",
			method: "get",
			dataType: "xml",
			success: function (data) {
				//Enter solar system
				var planets = $(data).find("SOLAR_SYSTEM > PLANETS").children();
				//Load each planet into solar.planets
				for (var i = 0, len = planets.length; i < len; loadPlanet(planets[i++]));
				solar.status.loaded = true;

				if (typeof callback === "function") callback(solar.planets);
			}
		});
	}

	function reset() {
		solar.planets = [];
		solar.status.loaded = false;
	}

	//Public methods
	
	solar.loadApi = function (callback) {
		//Reset if needed
		if (solar.status.loaded) {
			reset();
		}

		loadApi(callback);
	};

}(window.solar = window.solar || {}));