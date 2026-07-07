#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform vec2 u_mouse;
//uniform sampler2D u_tex;
out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
const float PHI = 1.61803398874989484820458683436564;
const float GAMMA = 0.57721566490153286060651209008240243;
const float GOLDEN_RATIO = 1.61803398874989484820458683436564;
// http://dev.thi.ng/gradients/
vec3 pal( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float line(float x, float y, float line_width, float edge_width){
  return smoothstep(x-line_width/2.0-edge_width, x-line_width/2.0, y) - smoothstep(x+line_width/2.0, x+line_width/2.0+edge_width, y);
}

float circle(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
  pt -= center;
  float len = length(pt);
  float result = smoothstep(radius-line_width/2.0-edge_thickness, radius-line_width/2.0, len) - smoothstep(radius + line_width/2.0, radius + line_width/2.0 + edge_thickness, len);
return result;
}

// ?? usage: vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate);
// ?? usage: coswarp(uv_c1, 3.0);
void coswarp(inout vec3 trip, float warpsScale ){
  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (u_time * .25));
}

void uvRipple(inout vec2 uv, float intensity, float rate){
  vec2 p = uv -.5;
  float cLength=length(p);
uv = uv +(p/cLength)*cos(cLength*15.0-rate*.5)*intensity;
}

float smoothMod(float x, float y, float e){
  float top = cos(PI * (x/y)) * sin(PI * (x/y));
  float bot = pow(sin(PI * (x/y)),2.);
  float at = atan(top/bot);
  return y * (1./2.) - (1./PI) * at ;
}

vec2 modPolar(vec2 p, float repetitions) {
  float angle = 2.*3.14/repetitions;
  float a = atan(p.y, p.x) + angle/2.;
  float r = length(p);
  //float c = floor(a/angle);
  a = smoothMod(a,angle,033323231231561.9) - angle/2.;
  //a = mix(a,)
  vec2 p2 = vec2(cos(a), sin(a))*r;
  return p2;
}

float stroke(float x, float s, float w){
  float d = step(s, x+ w * .5) - step(s, x - w * .5);
  return clamp(d, 0., 1.);
}

// *Classic Perlin 2D Noise by Stefan Gustavson (improved by Ian McEwan, Ashima Arts)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P) {
vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
vec4 ix = Pi.xzxz;
vec4 iy = Pi.yyww;
vec4 fx = Pf.xzxz;
vec4 fy = Pf.yyww;
vec4 i = permute(permute(ix) + iy);
vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
vec4 gy = abs(gx) - 0.5;
vec4 tx = floor(gx + 0.5);
gx = gx - tx;
vec2 g00 = vec2(gx.x,gy.x);
vec2 g10 = vec2(gx.y,gy.y);
vec2 g01 = vec2(gx.z,gy.z);
vec2 g11 = vec2(gx.w,gy.w);
vec4 norm = 1.79284291400159 - 0.85373472095314 *
vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
g00 *= norm.x;
g01 *= norm.y;
g10 *= norm.z;
g11 *= norm.w;
float n00 = dot(g00, vec2(fx.x, fy.x));
float n10 = dot(g10, vec2(fx.y, fy.y));
float n01 = dot(g01, vec2(fx.z, fy.z));
float n11 = dot(g11, vec2(fx.w, fy.w));
vec2 fade_xy = fade(Pf.xy);
vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
return 2.3 * n_xy;
}

float noise1d(float v){
  return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

float random2d(vec2 coord, float seed){
  const float a = 12.9898;
  const float b = 78.233;
  const float c = 43758.543123;

  return fract(sin(dot(coord.xy, vec2(a, b)) + seed) * c);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random2d(i, 0.0);
  float b = random2d(i + vec2(1.0, 0.0), 0.0);
  float c = random2d(i + vec2(0.0, 1.0), 0.0);
  float d = random2d(i + vec2(1.0, 1.0), 0.0);
  // Smooth Interpolation

  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f*f*(3.0-2.0*f);
  // u = smoothstep(0.,1.,f);

  // Mix 4 coorners percentages
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

//varying vec2 vUv;

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  float p0 = cnoise(uv * 200.);
  // float p0 = cnoise(uv * 200.);
  // vec2 uv_sub1 = fract(uv * 20.0 + rateq + p0 * (sin(cos(rate))) / atan(rated, GOLDEN_RATIO * uv.x));
  vec2 uv_sub1 = fract(uv * 2000.0);
  
  vec3 cp1 = pal(
	cnoise(uv + 0.125 + rateq + cnoise((rateq * .25) + uv)),
	vec3(0.80, 0.50, 0.40),
	vec3(0.20, 0.40, 0.20),
	vec3(2.00, 1.00, 1.00),
	vec3(0.50, 0.20, 0.25)
  ) - vec3(.5, .6, .7);
  // vec3 cp1 = pal(
	// cnoise(uv + 0.125 + cnoise((rateq * .25) + uv)),
	// vec3(0.30, 0.30, 0.50),
	// vec3(0.30, 0.30, 0.50),
	// vec3(0.80, 0.80, 0.50),
	// vec3(0.10, 0.30, 0.70)
  // ) + (vec3(.2, .6, .7) * .5);
  // vec3 cp1 = pal(
	// cnoise(uv + 0.125 + cnoise((rateq * .25) + uv)),
	// vec3(0.58, 0.74, 0.70),
	// vec3(1.00, 0.45, 0.32),
	// vec3(1.12, 0.84, 2.00),
	// vec3(0.34, 0.33, 0.18)
  // ) + (vec3(.2, .6, .7) * .5);

  float p1 = noise(cp1.rb / cp1.g);
  float p2 = cnoise(uv_sub1 - uv.x);

   vec3 cp2 = pal(
	uv_sub1.y,
	vec3(0.30, 0.30, 0.50),
	vec3(0.30, 0.30, 0.50),
	vec3(0.80, 0.80, 0.50),
	vec3(0.10, 0.30, 0.70)
  );
  // ?? best!!
  //  vec3 cp2 = pal(
	// uv_sub1.y,
	// vec3(0.96, 0.96, 0.93),
	// vec3(0.05, 0.03, 0.02),
	// vec3(0.25, 0.28, 0.22),
	// vec3(1.00, 1.00, 1.00)
  // );
  //  vec3 cp2 = pal(
	// cnoise(uv + 0.125 + cnoise((rateq * .25) + uv)),
	// vec3(0.80, 0.50, 0.40),
	// vec3(0.20, 0.40, 0.20),
	// vec3(2.00, 1.00, 1.00),
	// vec3(0.50, 0.20, 0.25)
  // );
  //  vec3 cp2 = pal(
	// cnoise(uv + 0.125 + cnoise((rateq * .25) + uv)),
	// vec3(0.58, 0.35, 0.60),
	// vec3(1.00, 0.45, 0.32),
	// vec3(1.12, 0.84, 2.00),
	// vec3(0.34, 0.33, 0.32)
  // );

 vec3 c_uv1 = vec3(-uv.y, .2, uv_sub1.y);
  // coswarp(c_uv1, 4.0);
  vec3 cm1 = mix(cp1, cp2, p1);
  vec3 cm2 = mix(cp2 - c_uv1, cm1 / cp1, p2) * 0.73;

  vec3 c_out = cm2;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}