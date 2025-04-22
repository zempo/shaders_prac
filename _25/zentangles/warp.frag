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

/***
Performance Notes
Optimized: Uses only 3 cosine calls (cheaper than noise functions)

GPU-Friendly: All operations are vectorized

Adjustable: Control intensity via warpsScale without recompiling

This function is perfect for creating organic-looking distortions in shaders (e.g., water surfaces, heat haze, or magical effects).

**/ 

void coswarp(inout vec3 trip, float warpsScale ){

  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (u_time * .25));
  
}


void uvRipple(inout vec2 uv, float intensity, float rate){

	vec2 p = uv -.5;


    float cLength=length(p);

     uv = uv +(p/cLength)*cos(cLength*15.0-rate*.5)*intensity;
} 

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  float rate = u_time * 3.0;
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  uv = fract(uv * 3.);
  uvRipple(uv, 5.51, rate);
// to subdivide uv space
//  rbg blog (regular, black n yellow, intense negative)
  // vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate);
  vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate) * vec3(.1, uv.x, uv.x);
  // vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate) * vec3(pow(uv.x, -2.), pow(uv.y * uv.x, -1.), uv.y);
  // vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate) * vec3(pow(uv.x, 2.), pow(uv.y * uv.x, -20.), pow(uv.y * uv.x, 2.));
  // vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate) * vec3(pow(uv.x, -20.), .1, pow(uv.y * uv.x, -20.));
  // vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate);
  // uv_c1 = fract(uv_c1 * 2.0) - 0.5;
  coswarp(uv_c1, 3.0);

  
  vec3 c1 = vec3(1.0);
  vec3 c_out = uv_c1;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}