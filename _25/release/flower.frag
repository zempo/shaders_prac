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

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  float rate0 = pow(u_time,E * .33);
  float rate1 = pow(u_time,E * .35);
  float rate2 = pow(u_time,E * .37);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;

  // ??? PATTERNS
  float seg0 = 1.0 * (TAU + 2.0 + (TAU * sin(rate0)));
  float seg2 = 1.0 * (TAU + 6.0 + (TAU * sin(rate0)));
  vec2 uv_0 = uv * 1.0; 
  vec2 uv_1 = uv * 1.0; 
  vec2 uv_2 = uv * 2.0; 
  uv_1 = fract(uv_1 * 2.0) - 0.5;

  uv_0 = modPolar((uv_0 * 1.0), seg0);
  uv_2 = modPolar((uv_2 * 1.0), seg2);
  uvRipple(uv_0, 1.51, rate0);
  vec3 c1 = c_palette(
    rate0 + uv_0.y - uv_0.x,
  vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));

  uv_1 = modPolar((uv_1 * 1.0), seg0);
  uvRipple(uv_1, 1.51, rate0);
  vec3 c2 = c_palette(
    uv_1.x + uv_1.y + rate0,
  vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  vec3 c3 = c_palette(
    rate0 + uv_0.y - uv_2.x,
  vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765)) * vec3(pow(uv_0.y * uv_2.x, 10.0), pow(uv_0.y * uv_2.x, -20.0), rate0);
  vec3 c5 = c_palette(
    rate0 + uv_0.x - uv_2.x,
  vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765)) * vec3(0.7, rate1 * pow(uv_2.y * uv_2.x, 2.0), rate0);


  // vec3 a1[6] = vec3[6](
  //  c3,c2,c1,c2,c2,c1
  // );
  vec3 a1[6] = vec3[6](
   c5,c5,c5,c5,c5,c5
  );
  int a1_idx = int(mod(rate0 / TAU, 6.0)); // Modulo cycles between 0, 1, 2...etc over time
  vec3 a_out1 = a1[int(a1_idx)];
  

  vec3 c_out = a_out1;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}