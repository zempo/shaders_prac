#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
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

// *Classic Perlin 2D Noise by Stefan Gustavson (improved by Ian McEwan, Ashima Arts)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

const float scale = 1.;
const vec3 d = vec3(0.957,0.439,0.043);

float hash_a(vec2 p) {
  return fract(sin(dot(p, vec2(27.609, 57.583)))*43758.5453);
}

vec3 hue_mod(float t){
  vec3 cmod = vec3(0.95, 0.97, 0.98);
  return .42 + (.425*cos(TAU*t*cmod*d));
}

void main(){
  float zoom = 1.0;
  // vec2 uv = zoom * ((gl_FragCoord.xy.xy - u_resolution.xy) / max(u_resolution.x,u_resolution.y));
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

  vec3 c1 = vec3(.0);
  vec2 vuv = uv;
  vec2 dv = uv;

  uv *= rotate(rate * .25);
  uv = vec2(log(length(uv)), atan(uv.y, uv.x))*3.5;
  uv.x -= rate*.25;

  dv = vec2(log(length(dv)), atan(dv.y, dv.x))*3.5;
  dv.x += rate*.25;

  float px = fwidth(uv.x);

  vec2 id = floor(uv * zoom);
  float chk = mod(id.y+id.x, 2.)*2. - 1.;

  float rand = hash_a(id);
  if(rand>.5){
    uv.x *=-1.0;
  }

  vec2 qv = fract(uv * zoom) - .5;

  // ??? PERM0: base

  // ??? gPERM0: base
  // float geo_0 = min(length(qv-vec2(-.5, .5))-.5, length(qv-vec2(.5, -.5))-.5);
  // // ??? gPERM1: shifty shapes
  // // float geo_0 = min(length(qv-vec2(-.5 - sin(rateh), .5 + cos(rateq)))-.5, length(qv-vec2(.5 / tan(rateq), -.5))-.5);
  // // ??? gPERM2: flowers (max instead of min)
  // // float geo_0 = max(length(qv-vec2(-.5 + cos(rateh), .5 / tan(rateh)))-.5, length(qv-vec2(.5, -.5))-.5);
  // float geo_1 = abs(geo_0) - .5;

  // float c2 = smoothstep(-px, px,abs(abs(geo_0)-.125)-.125);
  
  // geo_0 = (rand>.5^^chk>.5) ? smoothstep(px, -px, geo_0) : smoothstep(-px, px, geo_0);
  // geo_1 = smoothstep(.125, -px, geo_1);

  // dv = fract(dv * zoom) - .5;

  // float dots = min(length(abs(dv) - vec2(0., .5))-.25, length(abs(dv) - vec2(.5, 0.))-.5);


  // dots = abs(abs(abs(abs(dots) - .1) - .05) - .025) - .0125;
  // dots = smoothstep(-px, px, dots);

  // float hs = hash_a(vuv)*.25;

  // c1 = clamp(hue_mod(52.+id.x)+hs, c1, vec3(1.0));

  // c1 = mix(c1, c1 * .75, dots);
  // c1 = mix(c1, c1 * .75, geo_1);
  // c1 = mix(c1, vec3(.001), clamp(min(geo_0, c2), 0., 1.));

  // ?? PERM 1: four seasons
  // float geo_0 = min(length(qv-vec2(-.5, .5))-.5, length(qv-vec2(.5, -.5))-.5);
  // ??? gPERM2: flowers (max instead of min)
  float geo_0 = max(length(qv-vec2(-.5 + cos(rateh), .5 / tan(rateh)))-.5, length(qv-vec2(.5, -.5))-.5);
  float geo_1 = abs(geo_0) - .5;
 
//  ! smoothstep(-px, px >> smoothstep(px, -px
  float c2 = smoothstep(px, -px,abs(abs(geo_0)-.125)-.125);
  
  geo_0 = (rand>.5^^chk>.5) ? smoothstep(px, -px, geo_0) : smoothstep(-px, px, geo_0);
  geo_1 = smoothstep(.125, -px, geo_1);

  dv = fract(dv * zoom) - .5;

  float dots = min(length(abs(dv) - vec2(0., .5))-.25, length(abs(dv) - vec2(.5, 0.))-.5);

//  ! moving subdots
  dots = abs(abs(abs(abs(dots) - (.1 * sin(rate))) - .05) - .025) - .0125;
  dots = smoothstep(-px, px, dots);

  float hs = hash_a(vuv)*.25;

  c1 = clamp(hue_mod(52.+id.x)+hs, c1, vec3(1.0));

  c1 = mix(c1, c1 * .75, dots);
  c1 = mix(c1, c1 * .75, geo_1);

  vec3 cp1 = pal(
	dots,
	vec3(0.17 - cos(rate), 0.62, 0.11),
	vec3(0.30, 0.30, 0.50),
	vec3(0.80, 0.80, 0.50),
	vec3(0.10, 0.30, 0.70)
);
  c1 = mix(c1, cp1, clamp(min(geo_0, c2), 0.25, 1.));
  
  vec3 c_out = pow(c1, vec3(.4545));

  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}