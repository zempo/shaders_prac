#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
http://dev.thi.ng/gradients/
vec3 c_palette( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  
  vec3 c_1 = vec3(0.6471, 0.2039, 0.2039);
  FragColor = vec4(c_1, 1.0);
}