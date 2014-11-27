var Asteroid = function(x,y,params) {
	this.x = x;
	this.y = y;

	params = params || {};
	this.radius = typeof params.radius === "number" ? params.radius : Math.random()*32+32;
	this.mass = typeof params.mass === "number" ? params.mass : 500;

	var vel = P.calcOrbitVel(this, planet);
	this.vx = typeof params.vx === "number" ? params.vx : vel.vx;
	this.vy = typeof params.vy === "number" ? params.vy : vel.vy;

	this.r = typeof params.r === "number" ? params.r : Math.random()*Math.PI*2;
	this.vr = typeof params.vr === "number" ? params.vr : Math.random()*0.01;

	this.sprite = new PIXI.Graphics();
	this.sprite.beginFill(Asteroid.COLOR);

	var step = (Math.PI*2)/(~~(Math.random()*5)+5);
	var d = (Math.PI*this.radius*2)/(Math.PI*2/step);
	for (var i=0; i<Math.PI*2; i+=step) {
		var x = Math.cos(i)*this.radius,
			y = Math.sin(i)*this.radius;
		x += Math.random()*d*0.5-d*0.25;
		y += Math.random()*d*0.5-d*0.25;

		if (i===0) this.sprite.moveTo(x,y);
		else this.sprite.lineTo(x,y);
	}

	this.sprite.endFill();

	P.stage.container.addChildAt(this.sprite,1);
	P.objects.push(this);
};
Asteroid.COLOR = 0x7A5427;

Asteroid.prototype.step = function() {
	var gfx = P.calcGravity(this, planet);

	if (P.GRAVITY_ENABLED) {
		this.vx += gfx.vx;
		this.vy += gfx.vy;
	}

	this.x += this.vx;
	this.y += this.vy;
	this.r += this.vr;

	this.sprite.x = this.x;
	this.sprite.y = this.y;
	this.sprite.rotation = this.r;
};
Asteroid.prototype.destroy = function() {
	P.stage.container.removeChild(this.sprite);
	if (P.objects.indexOf(this)>=0) P.objects.splice(P.objects.indexOf(this), 1);
};