var ui = {
	proMarker: null,
	retroMarker: null,
	speed: null,
	alt: null,
	minimap: null,
	minimapSize: 150,

	init: function() {
		ui.proMarker = new PIXI.Graphics();
		ui.proMarker.lineStyle(2,0x00FF00,1);
		ui.proMarker.drawPolygon([
			new PIXI.Point(0,0),
			new PIXI.Point(32,16),
			new PIXI.Point(0,32)
		]);

		ui.retroMarker = new PIXI.Graphics();
		ui.retroMarker.lineStyle(2,0xFF0000,1);
		ui.retroMarker.drawPolygon([
			new PIXI.Point(0,0),
			new PIXI.Point(32,32)
		]);
		ui.retroMarker.drawPolygon([
			new PIXI.Point(32,0),
			new PIXI.Point(0,32)
		]);
		
		ui.speed = new PIXI.BitmapText("SPEED:\n99.9m/s", {
			font: "24pt VCR",
			fill: "white",
			align: "right"
		});
		ui.speed.position = {x:window.innerWidth/2-ui.speed.width-ui.minimapSize/2-64, y:window.innerHeight-ui.minimapSize};
		
		ui.alt = new PIXI.BitmapText("ALT:\n0000m", {
			font: "24pt VCR",
			fill: "white"
		});
		ui.alt.position = {x:window.innerWidth/2+ui.minimapSize/2+64, y:window.innerHeight-ui.minimapSize};
		
		ui.minimap = new PIXI.Graphics();
		ui.minimap.position = {x:window.innerWidth/2, y:window.innerHeight-ui.minimapSize};
	},

	build: function(container) {
		ui.init();
		container.addChild(ui.proMarker);
		container.addChild(ui.retroMarker);
		container.parent.addChild(ui.speed);
		container.parent.addChild(ui.alt);
		container.parent.addChild(ui.minimap);
	},
	
	drawOrbit: function(dest, size) {
		var pos = {
			x: ship.x,
			y: ship.y,
			vx: ship.vx,
			vy: ship.vy,
			mass: ship.mass
		};
		var startX = ship.x, startY = ship.y;
		var points = [];
		var maxVal = 0;
		var scaleup = 4;
		var peri = {x:0,y:0,alt:Infinity}, apo = {x:0,y:0,alt:0};
		var timer = Date.now();

		for (var i=0; i<5000 && Date.now()-timer<3; i++) {
			var gfx = P.calcGravity(pos, planet);
			pos.vx += gfx.vx*scaleup;
			pos.vy += gfx.vy*scaleup;
			
			pos.x += pos.vx*scaleup;
			pos.y += pos.vy*scaleup;
			
			maxVal = Math.max(maxVal,Math.max(Math.abs(pos.x), Math.abs(pos.y)));
			
			if (i%10==0) points.push({
				x: pos.x,
				y: pos.y,
				alt: pos.d
			});

			if (gfx.d>apo.alt) {
				apo.x = pos.x;
				apo.y = pos.y;
				apo.alt = gfx.d;
			}
			if (gfx.d<peri.alt) {
				peri.x = pos.x;
				peri.y = pos.y;
				peri.alt = gfx.d;
			}

			if (gfx.d<planet.rad) break;
			if (i>100 && Math.abs(pos.x-startX)<20 && Math.abs(pos.y-startY)<20) break;
		}
		
		var scale = size/(maxVal*2);
		
		dest.clear();
		dest.lineWidth = 0;
		
		dest.beginFill(0x0,0.3);
		dest.lineStyle(1,0xFFFFFF,1);
		dest.drawRect(-size/2-32,-size/2-32,size+64,size+64);
		dest.lineStyle();
		dest.endFill();

		//planet
		dest.lineStyle(2,peri.alt<=planet.rad?0xFF7060:0xFFFFFF, 1);
		dest.drawEllipse(0,0,planet.rad*scale,planet.rad*scale);
		dest.endFill();

		//asteroids
		dest.lineStyle(1, Asteroid.COLOR, 1);
		for (var i = P.objects.length - 1; i >= 0; i--) {
			var o = P.objects[i];
			if (o instanceof Asteroid) {
				var xx = o.x*scale,
					yy = o.y*scale;
				if (xx>-size/2-32 && yy>-size/2-32 && xx<size/2+32 && yy<size/2+32)
					dest.drawRect(xx-1, yy-1, 3, 3);
			}
		};
		
		//orbit
		dest.lineColor = 0x00FFFF;
		dest.lineWidth = 1;
		dest.moveTo(points[0].x*scale, points[0].y*scale);
		for (var i=1; i<points.length; i++) {
			dest.lineTo(points[i].x*scale, points[i].y*scale);
		}
		
		//pos marker
		dest.lineWidth = 2;
		dest.lineColor = 0xFF0000;
		dest.drawEllipse(points[0].x*scale, points[0].y*scale, 5, 5);

		//apo/peri markers
		dest.lineWidth = 1;
		dest.lineColor = 0x50FF10;
		dest.drawEllipse(apo.x*scale, apo.y*scale, 4, 4);
		dest.lineColor = 0xFF5010;
		dest.drawEllipse(peri.x*scale, peri.y*scale, 4, 4);
	},

	step: function() {
		ui.proMarker.position = {x: ship.x, y: ship.y};
		ui.retroMarker.position = {x: ship.x, y: ship.y};
	
		var vel = Math.sqrt(ship.vx*ship.vx+ship.vy*ship.vy);
		var angle = Math.atan2(ship.vy, ship.vx);
		ui.proMarker.rotation = angle;
		ui.retroMarker.rotation = Math.PI+angle;
		
		var pos = 96 + 5*vel;
		ui.proMarker.pivot = {x:-pos, y:16};
		ui.retroMarker.pivot = {x:-pos, y:16};

		ui.speed.setText("SPEED:\n"+ship.speed.toFixed(1)+"m/s");
		ui.alt.setText("ALT:\n"+ship.alt.toFixed(0)+"m");
		
		ui.drawOrbit(ui.minimap, ui.minimapSize);
	}
};