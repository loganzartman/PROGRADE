/**
 * A starbox shader
 */
StarboxFilter = function() {
 	PIXI.AbstractFilter.call( this );

 	this.passes = [this];

    // set the uniforms
    this.uniforms = {
    	resolution: {type: '2f', value: {x: 800, y: 600}},
    	offset: {type: '2f', value: {x: 0, y: 0}}
    };

    this.fragmentSrc = [
	    "precision mediump float;",
	    "uniform vec2 offset;",
	    "uniform vec2 resolution;",
	    "varying vec2 vTextureCoord;",
	    "vec3 g1col = vec3(0.5,0.4,0.8);",
	    "vec3 g2col = vec3(0.9,0.3,0.6);",
	    "float t1 = 0.90;",
	    "float t2 = 0.94;",
	    "float t3 = 0.96;",
	    "vec2 seed = vec2(13, 5);",
	    "vec3 mod289(vec3 x) {",
	    "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
	    "}",
	    "vec2 mod289(vec2 x) {",
	    "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
	    "}",
	    "vec3 permute(vec3 x) {",
	    "  return mod289(((x*34.0)+1.0)*x);",
	    "}",
	    "float snoise(vec2 v) {",
	    "	const vec4 C = vec4(0.211324865405187,  ",
	    	"          	            0.366025403784439,  ",
	    	"           	           -0.577350269189626,  ",
	    	"            	            0.024390243902439); ",
		"	vec2 i  = floor(v + dot(v, C.yy) );",
		"	vec2 x0 = v -   i + dot(i, C.xx);",
		"	vec2 i1;",
		"	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
		"	vec4 x12 = x0.xyxy + C.xxzz;",
		"	x12.xy -= i1;",
		"	i = mod289(i); ",
		"	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
			"		+ i.x + vec3(0.0, i1.x, 1.0 ));",
		"	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
		"	m = m*m ;",
		"	m = m*m ;",
		"	vec3 x = 2.0 * fract(p * C.www) - 1.0;",
		"	vec3 h = abs(x) - 0.5;",
		"	vec3 ox = floor(x + 0.5);",
		"	vec3 a0 = x - ox;",
		"	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",
		"	vec3 g;",
		"	g.x  = a0.x  * x0.x  + h.x  * x0.y;",
		"	g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
		"	return 130.0 * dot(m, g);",
		"}",
		"void main() {",
		"	vec2 p = gl_FragCoord.xy / resolution.xx;",
		"	vec2 m = offset-0.5;",
		"	vec3 col = vec3(0);",
		"	float n1 = snoise((p+m*0.2)*100.0);",
		"	float n2 = snoise((p+24241.532+m*0.6)*75.0);",
		"	float n3 = snoise((p+36241.961+m)*50.0);",
		"	float g1 = snoise((p+m*0.05))*0.5 + 0.7;",
		"	float g1_d = snoise((p+m*0.05)*0.5)*0.5 + 0.7;",
		"	float g2 = snoise((p+m*0.2+1358.245)*4.0);",
		"	float g2_d = snoise((p+m*0.2+1358.245)*1.0);",
		"	if (n1>t1) {n1 = (n1-t1)/(1.0-t1);}",
		"	else n1 = 0.0;",
		"	col.rgb = vec3(n1)*0.5;",
		"	if (n2>t2) {n2 = (n2-t2)/(1.0-t2);}",
		"	else n2 = 0.0;",
		"	col.rgb += vec3(n2);",
		"	if (n3>t3) {n3 = (n3-t3)/(1.0-t3);}",
		"	else n3 = 0.0;",
		"	col.rgb += vec3(n3);",
		"	col.rgb += g1*g1_d*g1col*0.5;",
		"	col.rgb += (g2*g2_d-g1*g1_d)*g2col*0.1;",
		"	gl_FragColor = vec4(col.rgb,1.0);",
		"}"
	];
};

StarboxFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
StarboxFilter.prototype.constructor = StarboxFilter;

/**
 * Offset.
 * 
 * @property offset
 * @type Point
 */
Object.defineProperty(StarboxFilter.prototype, 'offset', {
    get: function() {
        return this.uniforms.offset.value;
    },
    set: function(value) {
        this.uniforms.offset.value = value;
    }
});

function tweenCols(a,b,f) {
	return [
		a[0]*(1-f) + b[0]*f,
		a[1]*(1-f) + b[1]*f,
		a[2]*(1-f) + b[2]*f
	];
}