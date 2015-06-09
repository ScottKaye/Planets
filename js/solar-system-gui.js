/**
 * GUI methods for the solar system.
 */
(function (solar, undefined) {
	"use strict";

	//Private vars

	var _w = window.innerWidth;
	var _h = window.innerHeight;
	var _z = 0;
	var _paper = null;
	var _tooltip = null;

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
		//Put tooltip beside planet + offset
		var x = evt.pageX;
		var y = evt.pageY;

		//If the tooltip hasn't already been created, create it.
		$(_tooltip).stop().animate({
			top: y,
			left: x,
			opacity: 1
		}, 250);
	}

	/**
	 * Fades out the tooltip.
	 */
	function hidePlanetTooltip() {
		$(_tooltip).stop().animate({
			opacity: 0
		}, 250);
	}

	/**
	 * Lights up an orbit path ring.
	 */
	function ringOn() {
		this.animate({
			opacity: 0.3
		}, 100);
	}

	/**
	 * Dims the orbit path ring.
	 */
	function ringOff() {
		this.animate({
			opacity: 0.2
		}, 100);
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
		window.addEventListener("wheel", function (e) {
			var delta = e.wheelDelta / 120;

			_z += delta;

			if (_z < -10 || _z > 10) {
				_z -= delta;
				return;
			}

			var vBWo = viewBoxWidth;
			var vBHo = viewBoxHeight;
			var mult = delta > 0 ? 0.9 : 1.1;

			viewBoxWidth *= mult;
			viewBoxHeight *= mult;

			viewBox.X -= (viewBoxWidth - vBWo) / 2;
			viewBox.Y -= (viewBoxHeight - vBHo) / 2;
			_paper.setViewBox(viewBox.X, viewBox.Y, viewBoxWidth, viewBoxHeight);
		});

		//Handle panning
		document.addEventListener("mousedown", function (e) {
			//Middle mouse was clicked
			if (e.button === 1) {
				e.preventDefault();
			}
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

		while (i--) {
			var p = solar.planets[i];
			p.orbit.progress += p.orbit_time_step;

			var progress = p.orbit.length / (100 / p.orbit.progress);
			if (progress >= p.orbit.length) p.orbit.progress = 0;

			var pos = p.orbit.getPointAtLength(progress);

			//Move planet
			p.set.animate({
				cx: pos.x,
				cy: pos.y
			}, 100);

			//Satellites
			if (p.satellites) {
				var j = p.satellites.length;
				while (j--) {
					var s = p.satellites[j];
					s.orbit.progress += 2;

					var sProgress = s.orbit.length / (100 / s.orbit.progress);
					if (sProgress >= s.orbit.length) s.orbit.progress = 0;


					var sPos = s.orbit.getPointAtLength(sProgress);

					//Move satellite along orbit
					s.circle.animate({
						cx: sPos.x,
						cy: sPos.y
					}, 100);

					//Move satellite orbit with planet
					s.orbit.animate({
						cx: pos.x,
						cy: pos.y
					});
				}
			}
		}
	}

	/**
	 * Adds each planet along their orbits.
	 */
	function initSolarSystem() {
		//Create sun behind all other elements
		var sunRadius = 25;
		_paper.circle(_w / 2, _h / 2, sunRadius).attr({
			fill: "#ff9900",
			"stroke-width": 0
		}).noclick().glow({
			color: "#ff9900",
			width: 50
		});

		//First find max distance and radius for normalization
		var p, i;
		var max = {
			distance: 0,
			radius: 0
		};
		i = solar.planets.length;
		while (i--) {
			p = solar.planets[i];
			if (p.distance > max.distance) max.distance = p.distance;
			if (p.radius > max.radius) max.radius = p.radius;
		}

		//Load each planet
		i = solar.planets.length;
		while (i--) {
			p = solar.planets[i];

			console.log(p.name, p.orbit_time_step);
			
			//Normalized distance & radius
			var radius = p.radius / max.radius * _h / 50 + 2;
			radius = p.radius / 5000;
			var distance = p.distance / 10;
			

			//Create orbit path
			p.orbit = _paper.ellipse(_w / 2, _h / 2, distance, distance).attr({
					fill: "#5a4479",
					"stroke-width": 0,
					opacity: 0.2
				})
				.hover(ringOn, ringOff);
			p.orbit.length = p.orbit.getTotalLength();

			//Create planet, position randomly along orbit path
			var progress = p.orbit.length * Math.random();
			var pos = p.orbit.getPointAtLength(progress);

			var outlineSize = Math.max(radius * 1.2, 10);
			var outline = _paper.circle(pos.x, pos.y, outlineSize).attr({
				fill: p.color,
				"stroke-width": 0,
				opacity: 0.2
			});

			p.circle = _paper.circle(pos.x, pos.y, radius).attr({
				fill: p.color,
				"stroke-width": 0
			}).toFront().noclick();

			outline.hover(showPlanetTooltip, hidePlanetTooltip, p.circle);
			p.orbit.progress = progress;
			p.orbit.toBack();

			//Save planet with circle for tooltips/lookups
			//This is a circular reference, do not use for..in on this!
			p.circle.planet = p;

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
					s.orbit = _paper.circle(pos.x, pos.y, sRadius).attr({
						opacity: 0.05,
						stroke: "#000",
						"stroke-width": 1
					}).toBack().noclick();
					s.orbit.length = s.orbit.getTotalLength();

					//Find satellite position along orbit
					var sProgress = s.orbit.length * Math.random();
					var sPos = s.orbit.getPointAtLength(sProgress);

					s.orbit.progress = sProgress;

					//Create satellite
					s.circle = _paper.circle(sPos.x, sPos.y, radius * 0.25).attr({
						"stroke-width": 0,
						fill: "#333"
					}).noclick();
				}
			}

			p.set.push(p.circle);
			p.set.push(outline);
		}

		//Orbit animation
		window.setInterval(reOrbit, 100);
	}

	//Public methods

	/**
	 * Initializes the entire solar system GUI.
	 * @param {DOMElement} container Container to initialize Raphael.
	 */
	solar.loadGui = function (container) {
		console.log(container);
		if (!solar.status.loaded) {
			return;
		}

		initContainer(container);
		initSolarSystem();
	};

}(window.solar = window.solar || {}));