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

float rect( vec2 p, vec2 b, float s ) {
	vec2 v = abs(p) - b;
  	float d = length(max(v,0.0));
	return 1.0-pow(d, s);
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  float flash = 0.1*cos(u_time);
  float u_flash = 0.1*(sin(u_time)+4.001); // flash*0.5+0.5
  
  float p1 = rect(uv - vec2(-0.3, 0.0), vec2(0.1, 1.0), 0.1);
  vec3 c1 = vec3(0.2, 0.6, 1.0);

  float p2 = rect(uv - vec2(0.0, 0.0), vec2(0.1, 1.0), 0.1);
  vec3 c2 = vec3(0.6,0.99,0.2);

  float p3 = rect(uv - vec2(0.3, 0.0), vec2(0.1, 1.0), 0.2*u_flash);
  vec3 c3 = vec3(1.0,0.0,0.2);


  float p4 = rect(uv - vec2(1.0*tan(u_time), 0.0), vec2(1.0, 0.1), 0.2);
  vec3 c4 = vec3(1.0,1.0,1.0);

  vec3 c_out = (c1*p1)+(c2*p2)+(c3*p3 + (0.8*flash))+(c4*p4);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}