var camera = {
	x: 0,
	y: 0,
	zoom: 1,
	minZoom: 0.4,

	step: function() {
		var dx = ship.x-planet.x;
		var dy = ship.y-planet.y;
		var d = Math.sqrt(dx*dx+dy*dy);
		var scale = Math.min(window.innerWidth,window.innerHeight)/(d*0.5);
		if (scale<camera.minZoom) scale = camera.minZoom;
		var angle = Math.atan2(dy,dx);
		camera.zoom = scale;

		camera.x = ship.x*(1/camera.zoom) + ship.vx*camera.zoom*3;
		camera.y = ship.y*(1/camera.zoom) + ship.vy*camera.zoom*3;

		P.stage.container.pivot.x = camera.x*camera.zoom;
		P.stage.container.pivot.y = camera.y*camera.zoom;
		P.stage.container.x = window.innerWidth/2;
		P.stage.container.y = window.innerHeight/2;
		P.stage.container.scale = {x: camera.zoom, y: camera.zoom};
		P.stage.container.rotation = Math.PI-ship.r+ship.vr*4;
	}
};