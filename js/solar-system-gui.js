(function (solar, undefined) {
	"use strict";

	//Private vars

	var _guiSettings = {
		tooltipWidth: 200,
		tooltipHeight: 300,
		tooltipOffsetX: 15,
		tooltipOffsetY: 15
	};
	var _w = window.innerWidth;
	var _h = window.innerHeight;
	var _paper = null;
	var _tooltip = null;

	//Private methods

	//Disables mouse events
	Raphael.el.noclick = function () {
		this.node.setAttribute("pointer-events", "none");
	};

	function showPlanetTooltip(evt) {
		console.log(evt.target);
		var x = evt.target.cx.animVal.value + _guiSettings.tooltipOffsetX;
		var y = evt.target.cy.animVal.value + _guiSettings.tooltipOffsetY;

		if (!_tooltip) {
			_tooltip = _paper.rect(x, y, _guiSettings.tooltipWidth, _guiSettings.tooltipHeight).attr({
				fill: "#00ff00",
				opacity: 0
			}).animate({
				opacity: 1
			}, 100);
			_tooltip.noclick();
		} else {
			_tooltip.animate({
					opacity: 1
				}, 100)
				.attr({
					x: x,
					y: y
				});
		}
	}

	function hidePlanetTooltip() {
		_tooltip.animate({
			opacity: 0
		}, 100);
	}

	function ringOn() {
		this.animate({
			opacity: 0.3
		}, 100);
	}

	function ringOff() {
		this.animate({
			opacity: 0.2
		}, 100);
	}

	function initContainer(container) {
		_paper = new Raphael(container, _w, _h);

		var viewBoxWidth, viewBoxHeight, viewBox;
		viewBoxWidth = _paper.width;
		viewBoxHeight = _paper.height;

		viewBox = _paper.setViewBox(0, 0, _paper.width, _paper.height);
		viewBox.X = 0;
		viewBox.Y = 0;

		window.addEventListener("wheel", function (e) {
			var delta = e.wheelDelta / 120;
			var vBWo = viewBoxWidth;
			var vBHo = viewBoxHeight;

			if (delta > 0) {
				viewBoxWidth *= 0.9;
				viewBoxHeight *= 0.9;
			} else {
				viewBoxWidth *= 1.1;
				viewBoxHeight *= 1.1;
			}

			viewBox.X -= (viewBoxWidth - vBWo) / 2;
			viewBox.Y -= (viewBoxHeight - vBHo) / 2;
			_paper.setViewBox(viewBox.X, viewBox.Y, viewBoxWidth, viewBoxHeight);
		});
	}

	function reOrbit() {
		var i = solar.planets.length;

		while (i--) {
			var p = solar.planets[i];
			var progress = p.orbit.length / (100 / p.orbit.progress++);
			if (progress >= p.orbit.length) p.orbit.progress = 0;

			var pos = p.orbit.getPointAtLength(progress);

			p.circle.animate({
				cx: pos.x,
				cy: pos.y
			}, p.orbit_time);
		}
	}

	function initSolarSystem() {
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

			//Normalized distance & radius
			var distance = p.distance / max.distance * _w / 16;
			var radius = p.radius / max.radius * _h / 50 + 2;

			//Create orbit path
			p.orbit = _paper.ellipse(_w / 2, _h / 2, _w / distance, _h / distance).attr({
					fill: "#5a4479",
					"stroke-width": 0,
					opacity: 0.2
				})
				.hover(ringOn, ringOff);
			p.orbit.length = p.orbit.getTotalLength();

			//Create planet, position randomly along orbit path
			var pos = p.orbit.getPointAtLength(p.orbit.length / (1 / Math.random()));
			p.circle = _paper.circle(pos.x, pos.y, radius).attr({
					fill: p.color,
					"stroke-width": 0
				})
				.toFront();

			p.circle.hover(showPlanetTooltip, hidePlanetTooltip)
				.glow({
					//color: p.color,
					width: 1
				}).toBack();

			p.orbit.progress = 0;
			p.orbit.toBack();

			//Save planet with circle for tooltips/lookups
			//This is a circular reference, do not use for..in on this!
			p.circle.planet = p;

			//Orbit animation
			console.log(p);
			window.setInterval(function () {
				reOrbit(p);
			}, p.orbit_time);
		}

		//Create sun above all other elements
		var sunRadius = 5;
		_paper.circle(_w / 2, _h / 2, sunRadius).attr({
			fill: "#ff9900",
			"stroke-width": 0,
		}).glow({
			color: "#ff9900",
			width: 1
		}).toFront();
	}

	//Public methods

	solar.loadGui = function (container) {
		console.log(container);
		if (!solar.status.loaded) {
			return;
		}

		initContainer(container);
		initSolarSystem();
	};

}(window.solar = window.solar || {}));