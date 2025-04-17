#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform sampler2D u_tex;
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

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  vec2 uv0 = uv;
  float x0 = uv0.x;
  float y0 = uv0.y;
  uv = fract(uv * 2.0) - 0.5;
  float x = uv.x;
  float y = uv.y;
  float spiral_factor = .25 * 5.0;
  float spiral_factor0 = .1 * 5.0;
  float angle = atan(y, x);
  float radius = x*x + y*y;
  float angle0 = atan(y0, x0);
  float radius0 = x0*x0 + y0*y0;
  float p1 = mod(angle + spiral_factor * radius, TAU);
  float p0 = mod(angle0 + spiral_factor0 * sqrt(radius) * sqrt(radius0), TAU);

// to subdivide uv space
  float rate = u_time * 1.0;
  
  vec3 c1 = vec3(1.0);
  // vec3 c_out = vec3(1.0);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);

  float line1 = step(0. + sin(u_time / 1.25), uv.x); // Vertical line at x=0
  float line2 = step(0. + cos(u_time / 1.25), uv.y); // Vertical line at x=0
  // gl_FragColor = vec4(vec3(line), 1.0);
  float clamp1 = clamp(p1 * pow(sin(u_time), 2),0.2,0.7);
  vec3 c_out = vec3(line2 * 0.2, clamp1, clamp1) + vec3(line1 * 0.8, uv.x * pow(sin(u_time), 2), uv.x / pow(sin(u_time * 0.5), 2));

  FragColor = vec4(c_out, 1.0);
}