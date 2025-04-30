#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform sampler2D u_tex;
out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
// http://dev.thi.ng/gradients/
vec3 c_palette( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
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

// *Classic Perlin 2D Noise by Stefan Gustavson
vec4 permute(vec4 x) {
  return mod(((x*34.0)+1.0)*x, 289.0);
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  // uv = fract(uv * 10.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;



  // ????????????????????
 /** !!!
 !!!
 You're calculating log(...) of a value that can be zero or negative when uv.y is small (i.e. near the top of the screen), especially since uv.x - 0.5 / uv.y becomes negative as uv.y → 0. The log() of a negative number is undefined, which leads to NaNs or very low values, and thus, very dark colors
 */
//  !! log(uv.x - .5 / uv.y) causes NaN bug
  // float p1_example = sin(log(max(uv.x - .5 / uv.y * sin(rateq),.01)) * log(max(uv.y + .5 / uv.x,.01)) * log(max(uv.y - .5 / uv.x * sin(rateq),.01)));			
  // float p1_example = length(log(max(uv,.01))) + rateq;			
  float p1_example = 0.5 + 0.5 * cos(10.0 * log(max(uv.y,0.1)) + 3.0 * uv.y + rate);			
vec3 cp1 = c_palette(
	p1_example,
	vec3(0.150, .5 / log(max(uv.y * rate,0.1)), 0.9150),
	vec3(0.50, 1.0, 0.50 + sin(rate)),
	vec3(1.700, 1.900, 1.00),
	vec3(0.00, 0.33, 0.67)
);
  
  vec3 c_out = cp1;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}