#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex;
out vec4 FragColor;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
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

/**
  uv -= vec2(0.5);
  uv = rotate(uv, u_time, 2.0 / 1.5);
  uv += vec2(0.5);
*/ 
vec2 rotate(vec2 pt, float theta, float aspect){
  float c = cos(theta);
  float s = sin(theta);
  mat2 mat = mat2(c,s,-s,c);
  pt.y /= aspect;
  pt = mat * pt;
  pt.y *= aspect;
  return pt;
}

/**
  vec3 t1 = texture2D(u_tex, uv).rgb;
  vec3 c1 = vec3(0.4, 0.3686, 0.3373); // backgrond
  float t_adjust = inRect(uv, vec2(0.0),vec2(1.0));
  vec3 c_out = mix(c1, t1 - t2 * 0.25, t_adjust);
*/ 
float inRect (vec2 pt, vec2 btmL, vec2 topR) {
  vec2 s = step(btmL, pt) - step(topR, pt);
  return s.x * s.y;
}

void main(){
  float zoom = 1.0;
  vec2 uv_r = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;
  vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

  // ???typically a uniform
  float duration = 8.0;

  float len = fract(length(uv_r) * 3.0);
  vec2 ripple = uv + uv/len*0.03*cos(len*20.0-u_time*4.0);
  float delta = (sin(mod(u_time, duration) * (2.0*PI/duration))+1.0)/2.0;
  uv = mix(ripple, uv, delta); 
  
  // vec3 t1 = texture2D(u_tex, vec2(-uv.x,uv.y)).rgb; // flipped horizontally
  vec3 t1 = texture2D(u_tex, uv).rgb;
  vec3 t2 = texture2D(u_tex, vec2(-uv.x, uv.y)).bgb;
  vec3 c1 = vec3(0.4, 0.3686, 0.3373); // backgrond
  // vec3 c_out = texture2D(u_tex, uv).gbr;
  float t_adjust = inRect(uv, vec2(0.0),vec2(1.0));
  // vec3 c_out = mix(c1, t1 - t2 * 0.25, t_adjust);
  vec3 c_out = t1;
  //glslViewer -l FILE.frag texture.png 
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}