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
  float zoom = 2.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  // uv = fract(uv * 2.0) - 0.5;
  float rate = u_time * 1.0;
  float rate1 = u_time * 0.5;
  float rate2 = u_time * 0.25;

  float mob = 2.0; // Mobius strip factor

  float u = uv.x * mob * PI;  
float v = uv.y * mob - 1.0;  

vec3 mobius = vec3(  
    cos(u) + v * cos(u/mob) * cos(u),  
    sin(u) + v * cos(u/mob) * sin(u),  
    v * sin(u/mob)  
);  

// Fake lighting with dot product  
vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));  
float diffuse = dot(normalize(mobius), lightDir) * .5 + 0.5;  

 vec3 c1 = vec3(0.2039, uv.x, 0.3647);
 vec3 c2 = vec3(0.4118, 0.2627, 0.2627);
  vec3 c_out = mix(c1, c2, diffuse);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}