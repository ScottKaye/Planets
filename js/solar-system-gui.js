/**
 * GUI methods for the solar system.
 */
(function (solar, undefined) {
	"use strict";

	//Private vars

	var _update = 400; //Global animation speed (lower is faster, higher is easier on cpu)
	var _w = window.innerWidth;
	var _h = window.innerHeight;
	var _z = 0;
	var _paper = null;
	var _tooltip = null;
	var _orbitInterval = null;

	//Private methods

	/**
	 * Raphael extension method to disable mouse events from being processed on an element.
	 */
	Raphael.el.noclick = function () {
		this.node.setAttribute("pointer-events", "none");
		return this;
	};

	/**
	 * Creates and fades in the tooltip on the planet that was hovered.
	 * @param {Object} evt Mouse event containing position.
	 */
	function showPlanetTooltip(evt) {
		clearInterval(_orbitInterval);

		//Put tooltip beside planet + offset
		var x = evt.pageX;
		var y = evt.pageY;

		//If the tooltip hasn't already been created, create it.
		$(_tooltip).stop().animate({
			top: y,
			left: x,
			opacity: 1
		}, _update);

		_tooltip.innerHTML = planetTable(this.planet);
	}

	/**
	 * Fades out the tooltip.
	 */
	function hidePlanetTooltip() {
		$(_tooltip).stop().animate({
			opacity: 0
		}, _update);

		//Orbit animation
		_orbitInterval = window.setInterval(reOrbit, _update);
	}

	/**
	 * Creates an HTML table with relevant information about a planet.
	 * @param   {Object}      planet The planet to display information for.
	 * @returns {HTMLElement} Table of information.
	 */
	function planetTable(planet) {
		var container = $("<div></div>")
			.append(
				$("<h1></h1>")
				.text(planet.name)
			);
		var tableContainer = $("<div></div>").addClass("planet-table-container");
		var table = $("<table></table>");
		table.append(planetTableRow("Day", planet.day.natural + " <small>Earth hours</small>"));
		table.append(planetTableRow("Year", planet.length_of_year.natural + " <small>Earth years</small>"));
		table.append(planetTableRow("Mass", planet.mass.natural + " <small>times that of Earth</small>"));
		table.append(planetTableRow("Distance", planet.distance.natural + " <small>million km</small>"));
		table.append(planetTableRow("Radius", "~" + planet.radius.natural + " <small>km</small>"));
		tableContainer.append(table);

		if (planet.satellites) {
			tableContainer.append("<h2>Satellites</h2>");
			planet.satellites.forEach(function (s) {
				tableContainer.append(satelliteTable(s));
			});
		}
		else {
			tableContainer.append("<table><tr><td>No satellites.</td></tr></table>");
		}

		container.append(tableContainer);
		return container.html();
	}

	/**
	 * Helper method for planetTable - generates a row by name + value.
	 * @param   {string}      name  Name of row (left column).
	 * @param   {string}      value Value of row (right column).
	 * @returns {HTMLElement} Completed HTML TR element.
	 */
	function planetTableRow(name, value) {
		return $("<tr></tr>")
			.append($("<td></td>").text(name))
			.append($("<td></td>").html(value));
	}
	
	/**
	 * Creates an HTML table (contained within an element with a header) with relevant information about a satellite.
	 * @param   {Object}      satellite The satellite to read from.
	 * @returns {HTMLElement} The resulting element.
	 */
	function satelliteTable(satellite) {
		return $("<div></div>")
			.append(
				$("<h3></h3>").text(satellite.name)
			)
			.append(
				$("<table></table>")
				.append(planetTableRow("Orbit distance", satellite.distance_from_planet.natural + " <small>km</small>"))
				.append(planetTableRow("Orbit time", satellite.orbit.natural + " <small>Earth days</small>"))
			);
	}
	
	/**
	 * Lights up an orbit path ring.
	 */
	function ringOn() {
		this.animate({
			opacity: 0.3
		}, _update);
	}

	/**
	 * Dims the orbit path ring.
	 */
	function ringOff() {
		this.animate({
			opacity: 0.2
		}, _update);
	}

	/**
	 * Initializes Raphael context and events.  Also creates elements to be used in the GUI.
	 * @param {DOMElement} container Element to add Raphael context to.
	 */
	function initContainer(container) {
		_paper = new Raphael(container, _w, _h);

		var viewBoxWidth, viewBoxHeight, viewBox;
		viewBoxWidth = _paper.width;
		viewBoxHeight = _paper.height;

		viewBox = _paper.setViewBox(0, 0, _paper.width, _paper.height);
		viewBox.X = 0;
		viewBox.Y = 0;

		//Handle zoom
		container.addEventListener("wheel", function (e) {
			var delta = e.wheelDelta / 120;

			_z += delta;

			//Min/max zoom levels are 10 times in either direction
			if (_z < -10 || _z > 10) {
				_z -= delta;
				return;
			}

			var vBWo = viewBoxWidth;
			var vBHo = viewBoxHeight;
			var mult = delta > 0 ? 0.9 : 1.1;

			viewBoxWidth *= mult;
			viewBoxHeight *= mult;

			//Find scale values and set viewbox
			viewBox.X -= (viewBoxWidth - vBWo) / 2;
			viewBox.Y -= (viewBoxHeight - vBHo) / 2;
			_paper.setViewBox(viewBox.X, viewBox.Y, viewBoxWidth, viewBoxHeight);
		});

		//Create tooltip
		_tooltip = document.createElement("div");
		_tooltip.id = "tooltip";
		document.body.appendChild(_tooltip);
	}

	/**
	 * Repositions all planets along their orbit paths relative to time and progress.
	 */
	function reOrbit() {
		var i = solar.planets.length;

		//Loop through each planet
		while (i--) {
			var p = solar.planets[i];
			
			//Increase orbit progress
			p.orbit.progress += p.orbit_time_step;

			//Find current progress along orbit path
			var progress = p.orbit.length / (100 / p.orbit.progress);
			//Reset orbit at 100%
			if (progress >= p.orbit.length) p.orbit.progress = 0;

			//Find new position along orbit path
			var pos = p.orbit.getPointAtLength(progress);

			//Move planet
			p.set.animate({
				cx: pos.x,
				cy: pos.y
			}, _update);

			//Satellites
			if (p.satellites) {
				var j = p.satellites.length;
				//Loop through each satellite
				while (j--) {
					var s = p.satellites[j];
					//Satellites move at a constant speed (no speed specified in planets.xml)
					s.physicalOrbit.progress += 2;

					//Same thing as planet orbit calculations
					var sProgress = s.physicalOrbit.length / (100 / s.physicalOrbit.progress);
					if (sProgress >= s.physicalOrbit.length) s.physicalOrbit.progress = 0;

					var sPos = s.physicalOrbit.getPointAtLength(sProgress);

					//Move satellite along orbit
					s.circle.animate({
						cx: sPos.x,
						cy: sPos.y
					}, _update);

					//Move satellite orbit with planet
					s.physicalOrbit.animate({
						cx: pos.x,
						cy: pos.y
					}, _update);
				}
			}
		}
	}

	/**
	 * Adds each planet along their orbits.
	 */
	function initSolarSystem() {
		//Create sun behind all other elements
		//Sun is obviously not to scale (in fact, none of this really is)
		var sunRadius = 25;
		_paper.circle(_w / 2, _h / 2, sunRadius).attr({
			fill: "#ff9900",
			"stroke-width": 0
		}).noclick().glow({
			color: "#ff9900",
			width: 50
		});

		//First find max distance and radius for normalization
		var p, i = solar.planets.length;
		var max = {
			distance: 0,
			radius: 0
		};
		while (i--) {
			p = solar.planets[i];
			if (p.distance > max.distance) max.distance = p.distance;
			if (p.radius > max.radius) max.radius = p.radius;
		}

		//Load each planet
		i = solar.planets.length;
		while (i--) {
			p = solar.planets[i];

			//Normalized distance & radius
			var radius = p.radius / max.radius * _h / 50 + 2;
			radius = p.radius / 5000;
			var distance = p.distance / 10 + sunRadius * 1.5;

			//Create orbit path
			p.orbit = _paper.ellipse(_w / 2, _h / 2, distance, distance).attr({
					fill: "#5a4479",
					"stroke-width": 0,
					opacity: 0.2
				})
				.hover(ringOn, ringOff);
			p.orbit.length = p.orbit.getTotalLength();

			//Create planet, position randomly along orbit path
			var progress = p.orbit.length * i / solar.planets.length;
			var pos = p.orbit.getPointAtLength(progress);

			var outlineSize = Math.max(radius * 1.2, 10);
			//Planet "atmosphere", because most planets are too small to be individually moused over
			var outline = _paper.circle(pos.x, pos.y, outlineSize).attr({
				fill: p.color,
				"stroke-width": 0,
				opacity: 0.2
			});

			//Actual planet
			p.circle = _paper.circle(pos.x, pos.y, radius).attr({
				fill: p.color,
				"stroke-width": 0
			}).toFront().noclick();

			//Process hovers (mouseovers, mouseouts) on the atmosphere, since it is always larger than the planet itself
			outline.hover(showPlanetTooltip, hidePlanetTooltip, p.circle);
			p.orbit.progress = progress;
			p.orbit.toBack();

			//Save planet with circle for tooltips/lookups
			//This is a circular reference, do not use for..in on this!
			p.circle.planet = p;

			//Create a group to move planet items together later
			p.set = _paper.set();

			//Satellites
			if (p.satellites) {
				var j = p.satellites.length;
				while (j--) {
					var s = p.satellites[j];

					//Create orbit path
					var sRadius = radius * s.distance_from_planet / 100000;
					sRadius = Math.max(sRadius, radius * 5);
					sRadius = Math.min(sRadius, radius * 2.5);
					s.physicalOrbit = _paper.circle(pos.x, pos.y, sRadius).attr({
						opacity: 0.05,
						stroke: "#000",
						"stroke-width": 1
					}).noclick();
					s.physicalOrbit.length = s.physicalOrbit.getTotalLength();

					//Find satellite position along orbit
					var sProgress = s.physicalOrbit.length * Math.random();
					var sPos = s.physicalOrbit.getPointAtLength(sProgress);

					s.physicalOrbit.progress = sProgress;

					//Create satellite
					s.circle = _paper.circle(sPos.x, sPos.y, radius * 0.25).attr({
						"stroke-width": 0,
						fill: "#777"
					}).noclick();
				}
			}

			//Planet will move with its atmosphere through space
			p.set.push(p.circle);
			p.set.push(outline);
		}

		//Orbit animation
		_orbitInterval = window.setInterval(reOrbit, _update);
	}

	//Public methods

	/**
	 * Initializes the entire solar system GUI.
	 * @param {DOMElement} container Container to initialize Raphael.
	 */
	solar.loadGui = function (container) {
		if (!solar.status.loaded) {
			return;
		}

		initContainer(container);
		initSolarSystem();
	};

	/**
	 * Public extension for planetTable.
	 * @param   {Object}      planet Planet to return a table for.
	 * @returns {HTMLElement} The resulting table.
	 */
	solar.planetTable = function (planet) {
		return planetTable(planet);
	}

}(window.solar = window.solar || {}));