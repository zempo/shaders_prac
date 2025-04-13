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

mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);

  float rate0 = u_time;

  float rate = u_time * .25;
  float rate1 = u_time * .15;


  float subdiv = 4.0;

  vec2 cell = floor(uv * subdiv);
  vec2 uv_div = fract(uv * subdiv) - 0.5;
  vec2 uv_1 = uv;

  // Calculate time-based movement (right 1 unit, then up 1 unit per second)
  float moveTime = mod(rate0, 2.0); // Cycle every 2 seconds
  vec2 offset = vec2(
    smoothstep(0.0, 1.0, moveTime), // Right movement in first second
    smoothstep(1.0, 2.0, moveTime)  // Up movement in second second
  );

  // uv -= offset;

  uv_div = rotate(PI*rate) * uv_div;
  uv_1 = rotate(-PI*rate1) * uv_1;

  float x = uv_div.x;
  float y = uv_div.y;
  float x0 = uv_1.x;
  float y0 = uv_1.y;

  // x *= rate;
  // y *= rate;

  // ??? PERMUTATION 1 (black and white spiral)
  // float spiral_factor = 1. * 5.0;
  // float angle = atan(y, x);
  // float radius = x*x + y*y;
  // float p1 = mod(angle + spiral_factor * radius, TAU);
  // vec3 cp0 = c_palette(
  //   p1,
  //   vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)
  // );
  // float cp1 = smoothstep(0.0, 0.1, fract(p1 / TAU * 10.0));  

  // vec3 c_out = vec3(cp1);
  // ??? PERMUTATION 2 (color spiral spiral)
  float spiral_factor = .25 * 5.0;
  float spiral_factor0 = .1 * 5.0;
  float angle = atan(y, x);
  float radius = x*x + y*y;
  float angle0 = atan(y0, x0);
  float radius0 = x0*x0 + y0*y0;
  float p1 = mod(angle + spiral_factor * radius, TAU);
  float p0 = mod(angle0 + spiral_factor0 * sqrt(radius) * sqrt(radius0), TAU);

  vec3 cp0 = c_palette(
    p1,
    vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)
  );
  vec3 cp0b = c_palette(
    p0 * p1,
    vec3(0.2863, 0.4196, 0.5294),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.2, 0.0, 0.0549)
  );
  float cp1 = smoothstep(0.0, 0.1, fract(p1 / TAU * 10.0));  

  // vec3 c_out = vec3(cp0 * cp1) * vec3(cp0b);
  vec3 c_out = (vec3(cp0) + vec3(p0)) * vec3(cp0b + cp0) - vec3(cp0) - cp1;

// to subdivide uv space

  FragColor = vec4(c_out, 1.0);
}