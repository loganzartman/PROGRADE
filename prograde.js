var VK_LEFT=37, VK_UP=38, VK_RIGHT=39;

var P = {
	srcs: ["camera.js", "particle.js", "pixi.dev.js", "pixi.etc.js", "planet.js", "ship.js", "ui.js"],
	renderer: null,
	stage: null,
	starbox: null,
	mode: "menu",
	keys: [],
	objects: [],
	t: 0,
	G: 6.673*Math.pow(10,-11),
	GRAVITY_ENABLED: true,

	load: function() {
		var gate = (function() {
			var n=3;
			return function() {
				if (n--===1) P.init();
			};
		})();

		//load webfonts
		WebFontConfig = {
			google: {
				families: [ 'Raleway:200' ]
			},
			active: function() {
				gate();
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

		//load scripts
		var loader = function(n) {
			if (n<P.srcs.length) {
				var script = document.createElement("script");
				script.onload = function(){
					console.log("loaded "+script.src);
					if (P.srcs[n] === "pixi.dev.js") {
						//load bitmap fonts
						var assetsToLoad = ["font.fnt"];
						var al = new PIXI.AssetLoader(assetsToLoad);
						al.onComplete = function(){gate()};
						al.load();
					}
					loader(n+1);
				};
				script.src = "script/"+P.srcs[n];
				document.body.appendChild(script);
			}
			else gate();
		};
		loader(0);

		//DOM events
		document.addEventListener("keydown", function(event){
			P.keys[event.keyCode] = true;
		}, false);
		document.addEventListener("keyup", function(event){
			P.keys[event.keyCode] = false;
		}, false);
	},

	init: function() {
		P.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {antialias: true});
		P.renderer.view.style.position = "absolute";
		P.renderer.view.style.left = "0";
		P.renderer.view.style.top = "0";
		document.body.appendChild(P.renderer.view);

		PIXI.CIRCLE_SEGMENTS = 100;
		
		P.startMenu();

		ship.init();
		planet.init();
		ui.init();

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

		game.sbsz = Math.max(P.renderer.view.width, P.renderer.view.height)*Math.sqrt(2);
		var canv = document.createElement("canvas");
		canv.width = game.sbsz;
		canv.height = game.sbsz;
		game.starbox = PIXI.Sprite.fromImage(canv.toDataURL());
		game.starbox.filt = new StarboxFilter();
		game.starbox.shader = game.starbox.filt;
		game.starboxRenderer = new PIXI.RenderTexture(game.sbsz, game.sbsz);
		game.starboxSprite = new PIXI.Sprite(game.starboxRenderer);
		game.starboxSprite.position = {x:0, y:0};

		game.container = new PIXI.DisplayObjectContainer();
		game.addChild(game.container);
		game.container.addChild(game.starboxSprite);
		game.container.addChild(planet.sprite);
		game.container.addChild(ship.sprite);
		ui.build(game.container);
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
		ship.y = -11000;

		var vel = P.calcOrbitVel(ship, planet);
		ship.vx = vel.vx;
		ship.vy = vel.vy;

		ship.r = Math.PI;
		ship.vr = 0.01;
	},
	
	calcGravity: function(obj, target) {
		if (!target) target = planet;
		
		var dx = obj.x-target.x;
		var dy = obj.y-target.y;
		var d = Math.sqrt(dx*dx+dy*dy);
		var d2 = d*d;
		var g = P.G*((obj.mass*target.mass)/d2);
		var angle = Math.atan2(dy,dx);
		
		return {
			vx: -Math.cos(angle)*g,
			vy: -Math.sin(angle)*g,
			d: d,
			g: g,
			angle: angle
		};
	},

	//get velocity for a circular orbit
	calcOrbitVel: function(obj, target) {
		if (!target) target = planet;

		var dx = obj.x-target.x;
		var dy = obj.y-target.y;
		var d = Math.sqrt(dx*dx+dy*dy);

		var grav = P.calcGravity(obj, target);

		var spd = Math.sqrt(d*grav.g);
		return {
			vx: Math.cos(grav.angle+Math.PI/2)*spd,
			vy: Math.sin(grav.angle+Math.PI/2)*spd
		};
	},

	step: function() {
		P.t++;
		if (P.mode === "game") {
			if (P.t<60) P.stage.blackout.alpha = 1-P.t/60;
			planet.step();
			ship.step();

			P.stage.starbox.filt.offset = {
				x: ship.x*0.0005,
				y: ship.y*0.0005
			};
			
			for (var i = P.objects.length - 1; i >= 0; i--)
				if (typeof P.objects[i].step === "function") 
					P.objects[i].step();

			ui.step();
			camera.step();

			var sc = 1/camera.zoom;
			P.stage.starboxSprite.pivot = {x: (-ship.x)/sc+P.stage.sbsz/2, y: (-ship.y)/sc+P.stage.sbsz/2};
			P.stage.starboxSprite.scale = {x: sc, y: sc};
			P.stage.starboxRenderer.render(P.stage.starbox);
		}
		if (P.mode === "menu") {
			P.stage.title.alpha = Math.min(1,P.t/60) - Math.max(0,(P.t-60)/30);
			if (P.t>90) P.startGame();
		}
		
		P.renderer.render(P.stage);
	}
};
window.addEventListener("load", P.load, false);