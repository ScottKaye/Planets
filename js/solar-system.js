(function (solar, undefined) {
	"use strict";

	//Private vars

	var _status = {
		loaded: false
	};

	var _uuids = []; //List of generated UUIDs
	var _planets = [];

	//Private methods

	function genUUID() {
		var uuid = Math.random() * 1e6 * Date.now();
		uuid = uuid.toString(36).toUpperCase();
		//Only return unique UUIDs
		if (_uuids.indexOf(uuid) == -1) {
			_uuids.push(uuid);
			return uuid;
		} else genUUID();
	}

	function loadPlanet(node) {
		var props = {
			id: genUUID(),
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
			.data("planet", planet);
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