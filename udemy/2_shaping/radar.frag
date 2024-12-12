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
float getDelta(float val){
  return (sin(val)+1.0)/2.0;
}
  
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}
  
float rect(vec2 pt, float step_amt, vec2 center){
  return 1.0 - step(step_amt,max(
  abs(pt.x),
  abs(pt.y)
  ));
}
  
float rect_alt(vec2 pt, vec2 size, vec2 center, vec2 anchor) {
  vec2 p = pt - center;
  vec2 rad = size * 0.5;
  float horz = step(-rad.x, p.x) - step(rad.x,p.x);
  float vert = step(-rad.y, p.y) - step(rad.y,p.y);
  
  return horz * vert;
}
 
  
  /***
    float horz = step(-rad.x - anchor.x, p.x) - step(rad.x - anchor.x,p.x);
  float vert = step(-rad.y - anchor.y, p.y) - step(rad.y - anchor.y,p.y);
  
  **/


mat2 getRotationMatrix(float theta){
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, -s, s, c);
}
  
mat2 getScaleMatrix(float theta){
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, -s, s, c);
}

float circle(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
  pt -= center;
  float len = length(pt);
  float result = smoothstep(radius-line_width/2.0-edge_thickness, radius-line_width/2.0, len) - smoothstep(radius + line_width/2.0, radius + line_width/2.0 + edge_thickness, len);

  return result;
}
  
float line(float x, float y, float line_width, float edge_width){
  return smoothstep(x-line_width/2.0-edge_width, x-line_width/2.0, y) - smoothstep(x+line_width/2.0, x+line_width/2.0+edge_width, y);
}
  
float sweep(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness) {
  vec2 d = pt - center;
  float theta = u_time * 3.0;

  vec2 p = vec2(cos(theta), - sin(theta))*radius;
  float h = clamp(dot(d,p)/dot(p,p), 0.0, 1.0);
  // float h = dot(d,p)/dot(p,p);
  float l = length(d - p*h);

  float gradient = 0.0;
  float dt_x = (p.x < 0.0) ? 3.0:3.0;
  float dt_y = (p.y < 0.0) ? 1.0:1.0;
  
  // float dt_y = clamp(h, 0.0, 1.0);
  float pulse = clamp(abs(0.04 * sin(u_time * 1.5)),0.0,0.04);

  float rnd = random( d - 0.5 );
  float d_r = circle(d, vec2(rnd,rnd * PI), pulse, pulse, pulse + 0.01);
  
// circle(uv, vec2(0.0), currBand, 0.003, 0.001)
  const float gradient_angle = PI * 0.4;
  
  if (length(d) < radius) {
    float angle = mod(theta + atan(d.y, d.x), TAU);
    gradient = clamp(gradient_angle - angle, 0.0, gradient_angle)/gradient_angle*0.4;
  }

  return gradient + 1.0 - smoothstep(line_width, line_width+edge_thickness, l) + d_r;
}

float polygon(vec2 pt, vec2 center, float radius, int sides, float rotate, float edge_thickness){
  pt -= center;
  
  // Angle and radius from the current pixel
  float theta = atan(pt.y, pt.x) + rotate;
  float rad = TAU/float(sides);

  // Shaping function that modulate the distance
  float d = cos(floor(0.5 + theta/rad)*rad-theta)*length(pt);

  return 1.0 - smoothstep(radius, radius + edge_thickness, d);
}
  

void main() {
	/* Center and normalize our screen coordinates between -0.5 and 0.5 with aspect ratio */
	vec2 uv = 1.02 * (gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y;
  vec2 uv_g = uv;
  vec2 center = vec2(0.5);
  vec2 grid = fract(uv_g*10.0) - center;
  
  // uv = fract(uv * 2.0) - 0.5;

	vec3 c1 = vec3(uv.x, 0.0, uv.y);
  vec3 c2 = vec3(0.9,0.3,0.2);
  vec3 c3 = vec3(0.4,0.73,0.0);
  vec3 cw = vec3(1.0,1.0,1.0);
  
  vec3 c_axis = vec3(0.5 - clamp(abs(0.1*sin(u_time)),0.0,0.1));
  vec3 c_radar = vec3(0.01,0.6,0.3);
  
  
  // float p1 = line(uv.x * clamp(abs(cos(u_time)),0.0,1.0), uv.y * clamp(abs(sin(u_time)),0.0,1.0), 0.01, 0.01);
    float m1 = -(u_time * 2.0);

    float p_grid = line(grid.x,0.0,0.01,0.01) + line(0.0,grid.y,0.01,0.01);
  float axis = line(uv.y,0.0,0.002,0.001) + line(uv.x,0.0,0.0005,0.001);
   for(float i = 0.0; i < 6.0; i++){
     float currBand = i / 10.0;
  axis += circle(uv, vec2(0.0), currBand, 0.003, 0.001);
  }
  float p_sweep = sweep(uv, vec2(0.0), 0.5, 0.003, 0.001);
  vec3 c_r = mix(vec3(0.01,0.05,0.05),c_radar,p_sweep);
 
const float vals_x[4] = float[](0.0, 0.49, 0.0, -0.49);
const float vals_y[4] = float[](0.49, 0.0, -0.49, 0.0);
const float vals_dir[4] = float[](0.49, 0.0, -0.5, 1.0);
  
  
 float p_tris = 0.0;
   for(int i = 0; i < 4; i++){
     float currX = vals_x[i];
     float currY = vals_y[i];
     float currDir = vals_dir[i];
     
  p_tris += polygon(uv, vec2(currX, currY), 0.01, 3, currDir, 0.001);
  }
 
  // axis += sweep(uv, vec2(0.0), 0.5, 0.003, 0.001) * vec3(0.23,0.4,0.9);
  

  vec3 c_out = (p_grid*vec3(0.17))+(axis*c_axis)+(c_r)+(p_tris*c_axis)+vec3(0.15); 

  FragColor = vec4(c_out,1.0);
}