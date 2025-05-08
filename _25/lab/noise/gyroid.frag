#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform vec2 u_mouse;
uniform sampler2D u_tex1,u_tex2;
out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
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

// gyroid fxn
float gyroid(vec3 p) {
  return dot(cos(p), sin(p.yxz));
}

// fbm (fractal brownian motion) 
float fbm(vec3 p, float rate_mult) {
  float result = 0.0;
  float a = 0.5;

  float rate_local = u_time * rate_mult;

  float lim = 7.0;
  for(float i = 0.0; i < lim; ++i){
    p += result * .1;
    p.z += rate_local;
    result += abs(gyroid(p / a) * a);
    a /= 1.7;
  }
  return result;
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 uv = zoom * (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  uv *= 1.;

  // vec3 t1 = texture2D(u_tex1, uv).rgb;
  // vec3 t2 = texture2D(u_tex2, uv).rgb;
  // vec3 c1 = mix(vec3(uv * 3., rateq), t1, sin(rateq * .001));
  // float p1 = fbm(c1, 0.01);


//  ??? PERM 1: harmonics
// float scale = 100.0;
//   float d = gyroid(vec3(uv.x * scale,log(max(uv.y * scale,10.1)),rate * uv.x)); // Scale adjusts the frequency
//   float d2 = gyroid(vec3(uv.y * scale,log(max(uv.x * scale,10.1)),rate * uv.y)); // Scale adjusts the frequency
// float threshold = 0.5;
// float material = smoothstep(threshold - 0.1, threshold + 0.1, d);
// float material2 = smoothstep(threshold - 0.1, threshold + 0.1, d2);
  
// vec3 cp1 = pal(
// 	material + material2 + cnoise((uv * 4.) + rateh) + cnoise((uv * .2) + rateq),
// 	vec3(1.00, 0.30, 0.50),
// 	vec3(0.30, 0.30, 0.50),
// 	vec3(2.00, 0.97, 0.59),
// 	vec3(0.10, 0.30, 0.70)
// );

//  ??? PERM 2: dead pixels 
// float scale = 100.0 - (25. * sin(rateq * .5));
//   float d = gyroid(vec3(uv.x * scale,log(max(uv.y * scale,10.1)),rate * uv.x)); // Scale adjusts the frequency
//   float d2 = gyroid(vec3(uv.y * scale,log(max(uv.x * scale,10.1)),rate * uv.y)); // Scale adjusts the frequency
// float threshold = 0.5;
// float material = smoothstep(threshold - 0.1, threshold + 0.1, d);
// float material2 = smoothstep(threshold - 0.1, threshold + 0.1, d2);
  
// vec3 cp1 = pal(
// 	material + material2 / cnoise((uv * 4.) + rateh) * cnoise((uv * .2) + rateq),
// 	vec3(1.00, 0.30, 0.50),
// 	vec3(0.30, 0.30, 0.50),
// 	vec3(2.00, 0.97, 0.59),
// 	vec3(0.10, 0.30, 0.70)
// );

  // vec3 c_out = cp1;

//  ??? PERM 3: dead pixels 
float scale = 100.0 - (25. * sin(rateq * .5));
  float d = gyroid(vec3(uv.x * scale,log(max(uv.y * scale,10.1)),rate * uv.x)); // Scale adjusts the frequency
  float d2 = gyroid(vec3(uv.y * scale,log(max(uv.x * scale,10.1)),rate * uv.y)); // Scale adjusts the frequency
float threshold = 0.5;
float material = smoothstep(threshold - 0.1, threshold + 0.1, d);
float material2 = smoothstep(threshold - 0.1, threshold + 0.1, d2);
  
vec3 cp1 = pal(
	material * material2,
	vec3(1.00, 0.30, 0.50),
	vec3(0.30, 0.30, 0.50),
	vec3(2.00, 0.97, 0.59),
	vec3(0.10, 0.30, 0.70)
);

vec3 cp2 = pal(
	cnoise((uv * 4.) + rateh) + cnoise((uv * 5.2) + rateq),
	vec3(0.25, 0.57, 0.68),
	vec3(0.30, 0.30, 0.50),
	vec3(0.80, 0.80, 0.50),
	vec3(0.10, 0.30, 0.70)
);
//  !! add clamp here
  vec3 c_out = mix(cp1, cp2, sin(rateq * .5));
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  // FragColor = texture2D(u_tex, uv);
  FragColor += vec4(c_out, 1.0);
}