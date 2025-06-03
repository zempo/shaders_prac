#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
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

// *Classic Perlin 2D Noise by Stefan Gustavson (improved by Ian McEwan, Ashima Arts)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float getFieldAngle(vec2 uv) {
  float wave = min(sin(uv.x * 4.) + cos(uv.y * 3.),.01);

  // float angle = atan(uv.y, uv.x) + wave * 0.5; // Adjust the wave influence
  float angle = wave * 1.5 + PI; // Adjust the wave influence

  return angle;
}

const float SUBDIV = 100.0;

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  vec2 uv_g = zoom * (gl_FragCoord.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  vec2 cell_size = uv_g.xy / SUBDIV; // grid UV space
  vec2 cell = floor(cell_size); // grid cell
  vec2 cell_origin = fract(cell_size); // grid relative UV

  vec2 uv_cell = floor(uv_g / uv * atan(uv_g.y) / cell_size); // grid UV space for color

  float angle = getFieldAngle(uv_cell);

  vec2 dir = vec2(cos(angle), sin(angle)); // direction vector based on angle

  float line_length = min(cell_size.x, cell_size.y) * 0.4; // length of the line segment
  vec2 line_start = cell_origin - dir * line_length * 0.5; // start point of the line segment
  vec2 line_end = cell_origin + dir * line_length * 0.5; // end point of the line segment

  vec2 line_pos = line_end - line_start; // vector from start to end
  vec2 px_pos = uv - line_start; // vector from start to current position
  float t = clamp(dot(px_pos, line_pos) / dot(line_pos, line_pos), 0.0, 1.0); // projection factor
  vec2 closest_point = min(line_start + t * line_pos,.1); // closest point on the line segment
  float dist = distance(uv, closest_point); // distance from current position to the closest point

  float grid = min(step(.98,fract(uv_cell.x / cell_size.x)),
  step(.98,fract(uv_cell.y / cell_size.y))); // grid lines 

  float p_1 = length(uv) + (dot(uv_g, px_pos) * .00005);
  // float p_1 = length(uv) * exp(-length(uv_reset)) - p_1b;
  float freq = 8.0;
  p_1 = sin((p_1 * freq) - rate) / freq;
  p_1 = abs(p_1);
  p_1 = 0.01 / p_1;

  vec3 cp1 = pal(
	p_1 * SUBDIV,
	vec3(1.00, 1.00, 1.00),
	vec3(1.00, 1.00, 1.00),
	vec3(1.,1., 1.),
	vec3(0.15, 1.00, 0.00)
);
 
 vec3 c1 = mix(vec3(.2), cp1, smoothstep(PI / 2., .2, dir.x + dist));
//  c1 = mix(vec3(.2), cp1, smoothstep(TAU / 2., 1.2, dir.y * dist));
 
  vec3 c_out = c1; // color based on grid UV
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}