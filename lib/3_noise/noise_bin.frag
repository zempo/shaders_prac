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

vec3 mk_noise1(vec2 pt, float len, float rate) {
  float factor = 0.01;
  float c = cos(1000.5 * TAU);
  float s = sin(1000.5 * TAU);

  for(float i = 0.0; i < len; i++){
    float d = (i+3.) / len;
    float x = pt.x + rate + sin(pt.x * 7.0 + rate);
    float y = pt.y + sin(pt.x * d * 77.0 + rate) / d*factor + cos(pt.x * d + rate) / d*factor;

    pt.x = x * c - y * s;
		pt.y = x * s + y * c;
  }
  float col = length(pt)*0.25; 
  // abs(sin(rate*0.05))
  return vec3(cos(col)*1.,cos(col*200.0)*.51,cos(col*150.0)*2.0);
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