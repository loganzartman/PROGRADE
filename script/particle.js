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