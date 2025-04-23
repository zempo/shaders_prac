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

// Easing functions
float easeInSine(float t) { return 1.0 - cos((t * 3.141592) / 2.0); }
float easeOutSine(float t) { return sin((t * 3.141592) / 2.0); }
float easeInOutSine(float t) { return -(cos(3.141592 * t) - 1.0) / 2.0; }

float easeInQuad(float t) { return t * t; }
float easeOutQuad(float t) { return 1.0 - (1.0 - t) * (1.0 - t); }
float easeInOutQuad(float t) { return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0; }

float easeInCubic(float t) { return t * t * t; }
float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }
float easeInOutCubic(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }

float easeInExpo(float t) { return t == 0.0 ? 0.0 : pow(2.0, 10.0 * t - 10.0); }
float easeOutExpo(float t) { return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t); }
float easeInOutExpo(float t) {
    return t == 0.0 ? 0.0 : t == 1.0 ? 1.0 : t < 0.5 ? pow(2.0, 20.0 * t - 10.0) / 2.0 : (2.0 - pow(2.0, -20.0 * t + 10.0)) / 2.0;
}

// Main easing selector
float applyEasing(float t, int easeType) {
    switch(easeType) {
        case 0: return easeInSine(t);
        case 1: return easeOutSine(t);
        case 2: return easeInOutSine(t);
        case 3: return easeInQuad(t);
        case 4: return easeOutQuad(t);
        case 5: return easeInOutQuad(t);
        case 6: return easeInCubic(t);
        case 7: return easeOutCubic(t);
        case 8: return easeInOutCubic(t);
        case 9: return easeInExpo(t);
        case 10: return easeOutExpo(t);
        case 11: return easeInOutExpo(t);
        default: return t; // Linear fallback
    }
}

// Time-based easing with looping option
float easedTime(float u_time, float duration, int easeType, bool loop) {
    float t = mod(u_time, duration) / duration;
    if(!loop && u_time > duration) t = 1.0;
    return applyEasing(t, easeType);
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  float rate = u_time * 1.0;
  
  vec3 c1 = vec3(1.0);
  vec3 c_out = vec3(1.0);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}