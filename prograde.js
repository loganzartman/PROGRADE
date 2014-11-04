var VK_LEFT=37, VK_UP=38, VK_RIGHT=39;

var P = {
	renderer: null,
	stage: null,
	mode: "menu",
	keys: [],
	objects: [],
	t: 0,
	G: 6.673*Math.pow(10,-11),
	GRAVITY_ENABLED: true,

	load: function() {
		WebFontConfig = {
			google: {
				families: [ 'Raleway:200' ]
			},
			active: function() {
				P.init();
			}
		};
		(function() {
			var wf = document.createElement('script');
			wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
			         '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
			wf.type = 'text/javascript';
			wf.async = 'true';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(wf, s);
		})();

		document.addEventListener("keydown", function(event){
			P.keys[event.keyCode] = true;
		}, false);
		document.addEventListener("keyup", function(event){
			P.keys[event.keyCode] = false;
		}, false);
	},

	init: function() {
		P.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {antialias: true});
		P.renderer.view.style.position = "absolute";
		P.renderer.view.style.left = "0";
		P.renderer.view.style.top = "0";
		document.body.appendChild(P.renderer.view);
		
		P.startMenu();

		ship.init();
		planet.init();

		setInterval(P.step, 1000/60);
	},

	buildMenu: function() {
		var menu = new PIXI.Stage(0x000000);
		menu.title = new PIXI.Text("PROGRADE", {
			font: "50pt Raleway",
			fill: "white"
		});
		menu.title.position = {
			x: window.innerWidth/2 - menu.title.width/2,
			y: window.innerHeight/4
		};
		menu.addChild(menu.title);
		return menu;
	},

	buildGame: function() {
		var game = new PIXI.Stage(0x000000);
		game.blackout = new PIXI.Graphics();
		with (game.blackout) {
			beginFill(0x000000, 1);
			drawRect(0,0,window.innerWidth,window.innerHeight);
			endFill();
		}

		game.container = new PIXI.DisplayObjectContainer();
		game.container.addChild(planet.sprite);
		game.container.addChild(ship.sprite);
		ui.build(game.container);

		game.addChild(game.container);
		game.addChild(game.blackout);
		return game;
	},

	startMenu: function() {
		P.t = 0;
		P.mode = "menu";
		P.stage = P.buildMenu();
	},

	startGame: function() {
		P.t = 0;
		P.mode = "game";
		P.stage = P.buildGame();
		ship.x = 0;
		ship.y = -1500;
		ship.vx = P.GRAVITY_ENABLED?27:0;
		ship.vy = 0;
		ship.r = 0;
		ship.vr = 0;
	},

	step: function() {
		P.t++;
		switch (P.mode) {
			case "menu":
				P.stage.title.alpha = Math.min(1,P.t/60) - Math.max(0,(P.t-60)/30);
				if (P.t>90) P.startGame();
			break;

			case "game":
				if (P.t<60) P.stage.blackout.alpha = 1-P.t/60;
				planet.step();
				ship.step();
				
				for (var i = P.objects.length - 1; i >= 0; i--)
					if (typeof P.objects[i].step === "function") 
						P.objects[i].step();

				ui.step();
				camera.step();
			break;
		}
		
		P.renderer.render(P.stage);
	}
};
window.addEventListener("load", P.load, false);

var camera = {
	x: 0,
	y: 0,
	zoom: 1,

	step: function() {
		var dx = ship.x-planet.x;
		var dy = ship.y-planet.y;
		var d = Math.sqrt(dx*dx+dy*dy);
		var scale = Math.min(window.innerWidth,window.innerHeight)/d;
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

var planet = {
	x: 0,
	y: 0,
	mass: 10000000000,
	rad: 1200,
	sprite: null,

	init: function() {
		planet.sprite = new PIXI.Graphics();
		with (planet.sprite) {
			beginFill(0x908A85,1);
			drawEllipse(0,0,planet.rad,planet.rad);
			endFill();
		}
	},

	step: function() {
		planet.sprite.x = planet.x;
		planet.sprite.y = planet.y;
	}
}

var ship = {
	x: 0,
	y: -1500,
	r: 0,
	vx: 27,
	vy: 0,
	vr: 0,
	thrust: 200,
	rthrust: 1,
	mass: 1000,
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
		if (P.GRAVITY_ENABLED) {
			var dx = ship.x-planet.x;
			var dy = ship.y-planet.y;
			var d = Math.sqrt(dx*dx+dy*dy);
			var g = P.G*((ship.mass*planet.mass)/d);
			var angle = Math.atan2(dy,dx);
			ship.vx -= Math.cos(angle)*g;
			ship.vy -= Math.sin(angle)*g;
		}

		//thruster
		if (P.keys[VK_UP]) {
			var xc = Math.cos(ship.r-Math.PI);
			var yc = Math.sin(ship.r-Math.PI);
			ship.vx += xc*(ship.thrust/ship.mass);
			ship.vy += yc*(ship.thrust/ship.mass);

			var tx = Math.cos(ship.r);
			var ty = Math.sin(ship.r);

			for (var i=0; i<5; i++) {
				var v = Math.random()*3+7;
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
		if (P.keys[VK_LEFT]) ship.vr -= ship.rthrust/ship.mass;
		if (P.keys[VK_RIGHT]) ship.vr += ship.rthrust/ship.mass;
		ship.r += ship.vr;

		//update sprite
		ship.sprite.x = ship.x;
		ship.sprite.y = ship.y;
		ship.sprite.rotation = ship.r-Math.PI/2;
		ship.sprite.scale = {x:1, y:1};

		if (d<planet.rad) {
			P.startMenu();
		}
	}
};

var ui = {
	proMarker: null,
	retroMarker: null,

	init: function() {
		ui.proMarker = new PIXI.Graphics();
		ui.proMarker.lineColor = 0x00FF00;
		ui.proMarker.lineWidth = 1;
		ui.proMarker.drawPolygon([
			new PIXI.Point(0,0),
			new PIXI.Point(32,16),
			new PIXI.Point(0,32)
		]);

		ui.retroMarker = new PIXI.Graphics();
		ui.retroMarker.lineColor = 0xFF0000;
		ui.retroMarker.lineWidth = 1;
		ui.retroMarker.drawPolygon([
			new PIXI.Point(0,0),
			new PIXI.Point(32,16),
			new PIXI.Point(0,32)
		]);
	},

	build: function(container) {
		ui.init();
		container.addChild(ui.proMarker);
		container.addChild(ui.retroMarker);
	},

	step: function() {
		ui.proMarker.pivot = {x:0, y:0};
		ui.retroMarker.pivot = {x:0, y:0};

		ui.proMarker.position = {x: ship.x, y: ship.y};
		ui.retroMarker.position = {x: ship.x, y: ship.y};
	}
};

var Particle = function(params) {
	this.x = params.x||0;
	this.y = params.y||0;
	this.vx = params.vx||0;
	this.vy = params.vy||0;
	this.r = params.r||Math.random()*Math.PI*2;
	this.vr = typeof params.vr === "undefined" ? (-0.5+Math.random())*0.05 : params.vr;
	this.life = typeof params.life === "undefined" ? 30 : params.life;
	this.maxlife = this.life;
	this.size = params.size||8;

	this.col1 = typeof params.col1 === "undefined" ? 0xDA9A20 : params.col1;
	this.col2 = typeof params.col2 === "undefined" ? 0xAA1A05 : params.col2;
	this.col1 = PIXI.hex2rgb(this.col1);
	this.col2 = PIXI.hex2rgb(this.col2);

	this.sprite = new PIXI.Graphics();

	P.stage.container.addChildAt(this.sprite,1);
	P.objects.push(this);
}
Particle.prototype.step = function() {
	var cval = 1-this.life/this.maxlife;
	var col = tweenCols(this.col1, this.col2, cval);
	with (this.sprite) {
		clear();
		beginFill(PIXI.rgb2hex(col), 1);
		drawRect(0,0,this.size,this.size);
		endFill();
	}
	this.sprite.alpha = this.life/this.maxlife;

	if (this.life--<0) this.destroy();
	this.x += this.vx;
	this.y += this.vy;
	this.r += this.vr;
	this.sprite.x = this.x;
	this.sprite.y = this.y;
	this.sprite.rotation = this.r;
}
Particle.prototype.destroy = function() {
	P.stage.container.removeChild(this.sprite);
	if (P.objects.indexOf(this)>=0) P.objects.splice(P.objects.indexOf(this), 1);
};

function tweenCols(a,b,f) {
	return [
		a[0]*(1-f) + b[0]*f,
		a[1]*(1-f) + b[1]*f,
		a[2]*(1-f) + b[2]*f
	];
}