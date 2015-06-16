/**
 * Main API used by the rest of the application; responsible for loading and parsing planets.xml into a usable JS object.
 */
(function (solar, undefined) {
	"use strict";

	//Public vars

	solar.status = solar.status || {};
	solar.status.loaded = false;
	solar.planets = solar.planets || [];

	//Private methods
	
	/**
	 * Parses a planet node from XML into a usable planet object.
	 * @param {DOMElement} node XML node to process.
	 */
	function loadPlanet(node) {
		var props = {
			color: $(node).attr("COLOR"),
			name: $(node).find("> NAME").text(),
			distance: parseFloat($(node).find("> DISTANCE").text()),
			radius: parseFloat($(node).find("> RADIUS").text()),
			length_of_year: parseFloat($(node).find("> LENGTH_OF_YEAR").text()),
			day: parseFloat($(node).find("> DAY").text()),
			mass: parseFloat($(node).find("> MASS").text()),
			density: parseFloat($(node).find("> DENSITY").text()),
			satellites: loadSatellites($(node).find("> SATELLITES").children()),
		};
		props.orbit_time = props.length_of_year * 365;
		props.orbit_time_step = 1 - (props.orbit_time / 1e5);
		solar.planets.push(props);
	}

	/**
	 * Similar to loadPlanet, except this method loads data relating to satellites.
	 * @param   {DOMElement} node XML node to process.
	 * @returns {Object}     Usable satellite object.
	 */
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

	/**
	 * Downloads planets.xml and starts the loading process.
	 * @param {function} callback Function to run after all planets are loaded.
	 */
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

	/**
	 * Used while loading the API; will reset the load if a load has already happened.
	 */
	function reset() {
		solar.planets = [];
		solar.status.loaded = false;
	}

	//Public methods
	
	/**
	 * Public-facing loadApi.
	 * @param {function} callback Function to run after all planets are loaded.
	 */
	solar.loadApi = function (callback) {
		//Reset if needed
		if (solar.status.loaded) {
			reset();
		}

		loadApi(callback);
	};

}(window.solar = window.solar || {}));