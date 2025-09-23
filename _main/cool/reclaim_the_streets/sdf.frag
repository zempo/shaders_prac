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

// *****************************************************************************

// ?? box signed distance function (SDF).
float bo_sdf(vec3 p,vec3 r){
  vec3 p_dist = abs(p)-r;
  return max(max(p_dist.x,p_dist.y),p_dist.z);
}

// *****************************************************************************

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

    // * CALC
  float GOLDEN_ANGLE = TAU / GOLDEN_RATIO;
  float rad = length(uv);
  float angle = atan(uv.y, uv.x);

  // * GOLDEN SPIRAL
  float spiralFactor = 1. - (.5 * sin(rateq));
  float newRad = rad * (1. + spiralFactor * sin(angle * 5. - log(rad) * GOLDEN_ANGLE));

  // * remape angle from golden ratio
  float newAngle = angle + rateh + log(newRad + .1) * GOLDEN_ANGLE;

  vec2 uvGold = vec2(cos(newAngle) * newRad, sin(newAngle) * newRad);


  // signed dist fxn  (base, vec3(x, y, ?))
  float bx_w = .25;
  float bx_h = .35;
  float p0 = bo_sdf(vec3(uv, 0.),vec3(bx_w, bx_h, 1.));
  float p1 = smoothstep(-.05, .05, p0);
  float p2 = cos(sin(abs(p1) * 100.));
  float p3 = sin(exp(-40. * abs(p1)) * 100);
  float p4 = cos(sin(abs(p1) * 100.));
  float p6 = bo_sdf(vec3(fract(uvGold * 2.1) + uvGold, 0.),vec3(bx_w, bx_h, 1.));
  p6 = smoothstep(-.05, .01, p6);
  float p7 = bo_sdf(vec3(fract(uvGold * .1) - uvGold, 0.),vec3(bx_w, bx_h, 1.));
  p7 = smoothstep(-.01, .1, p7);

  // p6 += p2 + p4;
  // *flow-field-ish
  float stroke_lag = 2.1;
  float p8 = cos(sin(abs(p7) * stroke_lag / p6));




  vec3 c1 = vec3(1. - sin(pow(p1, p2)));
  vec3 c2 = vec3(p3 / p2) + vec3(p1) + vec3(p1 - p3, sin(p2), .91);
  // * ^ baseline, 
  vec3 cp1 = pal(
	p2 + p4 - cnoise(fract(uv * 5.3 + rateq)),
	vec3(1.00, 1.00, 1.00),
	vec3(1.00, 1.00, 1.00),
	vec3(2.00, 2.00, 2.00),
	vec3(0.15, 1.00, 0.00)
  );
  // *glitchy frame
  vec3 c3 = cp1;
  // *red/blue portal frame
  vec3 c4 = c3 + log(c1 * c2);
  // *stronger contrast
  vec3 c5 = c3 + log(c1 * c2) * abs(log(c2));
  // * news cycle
  vec3 c6 = vec3(p8 * p6) - vec3(p3 * p4);

  // * news cycle + glitchy frame, framed
  // * event horizon?
  vec3 cp2 = pal(
	max(log(p8 + cos(uvGold.x) / p1 - sin(uvGold.y)),.1) * p3,
	vec3(1.00, 1.00, 1.00),
	vec3(1.00, 1.00, 1.00),
	vec3(2.00, 2.00, 2.00),
	vec3(0.15, 1.00, 0.00)
  );
  // *drip frame
  vec3 cp3 = pal(
	max(log(p8 + cos(uvGold.x) / sin(uvGold.y)),.1) * p3,
	vec3(0.75, 0.50, 0.75),
	vec3(0.50, 0.50, 0.50),
	vec3(2.00, 0.98, 2.00),
	vec3(0.00, 0.33, 0.67)
  );
  vec3 c7 = cp2;
  vec3 c8 = cp3;
  // *love spiral
  vec3 c9 = mix(c8, c3 + c2, .15);
  // * ooozy frame
  vec3 c10 = mix(c8, c9, p3);
 
  // *biolumenescence
  vec3 c11 = mix(c8, c9, p3)/c4*sin(rateq)+.1;

  int len = 11;
  // TODO: replace c1,c2 with cooler colors
  vec3 aEx[11] = vec3[11](
    c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11
  );
  int aEx_idx = int(mod(rateh, float(len))); // Modulo cycles between 0, 1, 2...etc over time
  vec3 c_out = aEx[int(aEx_idx)];
  // c_out = c11;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}