var ship = {
	x: null,
	y: null,
	r: Math.PI,
	vx: null,
	vy: null,
	vr: 0.01,
	thrust: 40,
	rthrust: 0.5,
	maxr: 0.125,
	mass: 500,
	sprite: null,

	init: function() {
		ship.sprite = new PIXI.Graphics();
		with (ship.sprite) {
			beginFill(0xFFFFFF,1);
			drawPolygon([
				new PIXI.Point(0,32),
				new PIXI.Point(16,0),
				new PIXI.Point(32,32)
			]);
			drawRect(0,32,32,58);
			drawRect(6,90,20,6);
			endFill();
		}

		ship.sprite.pivot = new PIXI.Point(16,48);
	},

	step: function() {
		//gravity
		var gfx = P.calcGravity(ship, planet);
		ship.alt = gfx.d-planet.rad;

		if (P.GRAVITY_ENABLED) {
			ship.vx += gfx.vx;
			ship.vy += gfx.vy;
		}

		//thruster
		if (P.keys[VK_UP]) {
			var xc = Math.cos(ship.r-Math.PI);
			var yc = Math.sin(ship.r-Math.PI);
			ship.vx += xc*(ship.thrust/ship.mass);
			ship.vy += yc*(ship.thrust/ship.mass);

			var tx = Math.cos(ship.r);
			var ty = Math.sin(ship.r);

			for (var i=0; i<2; i++) {
				var v = Math.random()*2+4;
				new Particle({
					x: ship.x+tx*48+Math.random()*16-8,
					y: ship.y+ty*48+Math.random()*16-8,
					vx: ship.vx+tx*ship.thrust/v,
					vy: ship.vy+ty*ship.thrust/v,
					life: Math.random()*10+10
				});
			}
		}
		ship.x += ship.vx;
		ship.y += ship.vy;

		//rotation
		if (P.keys[VK_LEFT] && ship.vr>-ship.maxr) ship.vr -= ship.rthrust/ship.mass;
		if (P.keys[VK_RIGHT] && ship.vr<ship.maxr) ship.vr += ship.rthrust/ship.mass;
		ship.r += ship.vr;

		//update sprite
		ship.sprite.x = ship.x;
		ship.sprite.y = ship.y;
		ship.sprite.rotation = ship.r-Math.PI/2;
		ship.sprite.scale = {x:1, y:1};

		ship.speed = Math.sqrt(ship.vx*ship.vx+ship.vy*ship.vy);

		if (ship.alt<0) {
			P.startMenu();
		}
	}
};