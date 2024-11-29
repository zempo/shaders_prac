#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;

const float PI = 3.14159265359;
float f[32] = float[32]( 2.,1000.,3.,4.,5., 6.,7.,8.,9.,11.,12.,150.,99.,
                     40.,1.,10000.,2.,1100.,12.,100.,1000.,400.,210.,112.,113.,131.,
                     1300.,110.,1139.,1108.,1313.,1.);

void main(){
  vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 translate = vec2((sin(u_time / 1.0) * f[int(3)]),0.0);
  uv += translate;
  
  vec3 c_1 = vec3(1.0, uv.x, 0.3);
  FragColor = vec4(c_1, 1.0);
}