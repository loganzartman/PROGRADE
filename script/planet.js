var planet = {
	x: 0,
	y: 0,
	mass: 1e15,
	rad: 10000,
	sprite: null,
	col: 0x504A45,

	init: function() {
		planet.sprite = new PIXI.Graphics();
		with (planet.sprite) {		
			beginFill(planet.col,1);
			drawEllipse(0,0,planet.rad,planet.rad);
			endFill();
		}
	},

	step: function() {
		planet.sprite.x = planet.x;
		planet.sprite.y = planet.y;
	}
}