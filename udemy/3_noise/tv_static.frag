#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
// http://dev.thi.ng/gradients/
vec3 c_palette( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float rand ( vec2 st, float seed) {
  const float a = 12.9898;
  const float b = 78.233;
  const float c = 43758.543123;

  return fract(sin(dot(st, vec2(a, b)) + seed) * c);
}

void main(){
  float zoom = 0.0001;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
   uv = fract(uv * 1.0) - 0.5;
  
  float p1 = rand(vec2(uv*1.0), u_time / 10.0);
  vec3 c_p = c_palette( 
    p1,
    vec3(0.0941, 0.0078, 0.0627), vec3(0.6784, 0.9882, 0.8941), vec3(0.6078, 0.8078, 0.8549), vec3(0.0078, 0.1098, 0.0941)
  );
  vec3 c_out = smoothstep(0.24,0.36,c_p);
  FragColor = vec4(c_out, 1.0);
}