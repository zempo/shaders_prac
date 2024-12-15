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
  float zoom = 21.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  float dist = 0.11;
  float radius = 7.1;
  
  vec3 c1 = vec3(0.9 * sin(u_time), 0.0, 0.0);
  vec3 c2 = vec3(0.0, 0.9 * cos(u_time), 0.0);
  vec3 c3 = vec3(0.0, 0.0, 0.9 * -sin(u_time));

  float col1 = -0.3;
  float col2 = -0.3;
  float col3 = -0.3;

  // vec2 origin = 11.2 * (, )
  float rate = u_time * 0.5;
  for(float i = 0.0; i < 63.0; i++){
    float s_delta = sin(u_time + i * dist) * 1.05;
    float c_delta = cos(u_time + i * dist) * 2.05;

    col1 += 0.003 / abs(length(uv + vec2(s_delta + c_delta*cos(rate), c_delta)) - radius);
    col2 += 0.003 / abs(length(uv + vec2(s_delta - c_delta*cos(rate), c_delta)) - radius);
    col3 += 0.003 / abs(length(uv + vec2(s_delta - c_delta*sin(rate), c_delta)) - radius);
  }

  vec3 c_out = (c1*col1)+(c2*col2)+(c3*col3);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}
