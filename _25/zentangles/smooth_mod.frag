#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform sampler2D u_tex;
out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
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

// ?? usage: vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate);
// ?? usage: coswarp(uv_c1, 3.0);
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

float smoothMod(float x, float y, float e){
    float top = cos(PI * (x/y)) * sin(PI * (x/y));
    float bot = pow(sin(PI * (x/y)),2.);
    float at = atan(top/bot);
    return y * (1./2.) - (1./PI) * at ;
}

 
 vec2 modPolar(vec2 p, float repetitions) {
    float angle = 2.*3.14/repetitions;
    float a = atan(p.y, p.x) + angle/2.;
    float r = length(p);
    //float c = floor(a/angle);
    a = smoothMod(a,angle,033323231231561.9) - angle/2.;
    //a = mix(a,)
    vec2 p2 = vec2(cos(a), sin(a))*r;
    return p2;
}

  float stroke(float x, float s, float w){
  float d = step(s, x+ w * .5) - step(s, x - w * .5);
  return clamp(d, 0., 1.);
}
  
 //	Classic Perlin 2D Noise
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
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