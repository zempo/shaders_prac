#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse; // Mouse position in pixels
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
  float zoom = 1.25;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 mouseNorm = u_mouse / u_resolution;
  float mX = mouseNorm.x * 2.0 - 1.0;
  float mY = mouseNorm.x * 2.0 - 1.0;
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  // uv = fract(uv * vec2(1., 2.0));
  float rate = u_time * 1.0;
  float rate1 = u_time * .1;
  
float reaction = sin(uv.x * 30.0 + u_time) * sin(uv.y * 30.0);  
float diffusion = smoothstep(-0.2, 0.2 + sin(uv.x * 3.0 + u_time) + sin(uv.x * 20.0 + u_time/uv.y * .000010 + u_time), reaction); 

  // vec3 c_out = mix(c1, , );
  vec3 c1 = vec3(diffusion * abs(mX) - (mY/2.0), reaction - abs(mX),.2 + diffusion * abs(mY));
  vec3 c2 = vec3(reaction * abs(mX) - (mY/5.0), diffusion, reaction * abs(mY));
  vec3 c_out = mix(c1, c1, sin(uv.x * 2.0 + u_time));


  // FragColor = vec4(c_out, diffusion);
  FragColor = vec4(c_out, 1.0);
}