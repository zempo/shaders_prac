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

float random2d(vec2 coord, float seed){
  const float a = 12.9898;
  const float b = 78.233;
  const float c = 43758.543123;

  return fract(sin(dot(coord.xy, vec2(a, b)) + seed) * c);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random2d(i, 0.0);
  float b = random2d(i + vec2(1.0, 0.0), 0.0);
  float c = random2d(i + vec2(0.0, 1.0), 0.0);
  float d = random2d(i + vec2(1.0, 1.0), 0.0);
  // Smooth Interpolation

  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f*f*(3.0-2.0*f);
  // u = smoothstep(0.,1.,f);

  // Mix 4 coorners percentages
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float f[32] = float[32]( 2.,1000.,3.,4.,5., 6.,7.,8.,9.,11.,12.,150.,99.,
                     40.,1.,10000.,2.,1100.,12.,100.,1000.,400.,210.,112.,113.,131.,
                     1300.,110.,1139.,1108.,1313.,1.);

void main(){
  float zoom = 1.0;
  // vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float x_rate1 = abs(clamp(sin(u_time*0.5), 0.0, 1.0))+2.0;
  float x_rate2 = abs(clamp(sin(u_time*0.5), 0.0, 1.0))+2.5;
  float x_rate3 = abs(clamp(sin(u_time*0.5), 0.0, 1.0))+3.0;
  float y_rate = abs(clamp(sin(u_time*0.25), 0.0, 1.0))+7.0;

    float x_rates[6] = float[6](
    x_rate1, x_rate1, x_rate2, x_rate2, x_rate3, x_rate3
  );
  int r_idx = int(mod(u_time*.1, 6.0)); // Modulo cycles between 0, 1, 2
  float x_rate = x_rates[int(r_idx)];

  uv *= vec2(x_rate1, y_rate);
  // uv = fract(uv * 2.0) - 0.5;

  vec2 cell = floor(uv);
  vec2 xy = 2.0 * fract(uv) - 1.0;
  float i = cell.x + 4.0 * cell.y;
  float t = u_time * 0.5;
  float t_c = u_time / 3.0;
  float rate = xy.x + t;
  float p1 = sin(PI * f[int(i)] * rate);
  // float p1 = sin(PI * 2.0 * rate);
  float v = xy.y - 0.5*p1; 
    float c_pulse = fract(abs(clamp(0.2*sin(u_time), 0.0, 0.2)) * 8.5);
  float v_p = 1.0 - abs(v) / fwidth(v) / 1.5;

  // vec3 c1 = vec3(1.0);

  float c_pulse1 = abs(clamp(0.2*sin(u_time), 0.0, 0.2)) + 0.4;
  float c_pulse2 = abs(clamp(1.0*sin(u_time), 0.0, 1.0));
  float c_pulse3 = abs(clamp(0.667*sin(u_time), 0.0, 0.667));
  vec3 c0 = vec3(0.7804, 0.9725, 1.0);
  vec3 c0b = vec3(0.1529, 0.8588, 0.7529);
  vec3 c1 = c_palette(
    v,
    vec3(0.5, 0.5, 0.5),vec3(0.5, 0.5, 0.5),vec3(1.0, 1.0, 1.0),vec3(0.0, 0.333, 0.667)
  );
  vec3 c2 = c_palette(
    v,
    vec3(0.0, 0.333, 0.667),vec3(1.0, 1.0, 1.0),vec3(0.5, 0.5, 0.5),vec3(0.5, 0.5, 0.5)
  );

  // vec3 c2 = vec3(0.156);

  vec3 c_out1 = c0*v_p;
  vec3 c_out2 = c1*v_p;
  vec3 c_out3 = (c1*v_p)*(c1*v);
  vec3 c_out4 = v_p*sin(c2+t_c);
  vec3 c_out5 = (c1*v_p)+(c2);
  vec3 c_out6 = c0b*v_p;
  vec3 c_out7 = (c1*v_p)+(c2*v_p);
  vec3 c_out8 = (c1*v_p)*sin(c2+t_c);
  vec3 c_out9 = (c2*v_p)*(c2*v);

  vec3 c_outs[9] = vec3[9](
    c_out1, c_out2, c_out3, c_out4, c_out5, c_out6, c_out7, c_out8, c_out9
  );
  int c_idx = int(mod(t_c, 9.0)); // Modulo cycles between 0, 1, 2...etc
  vec3 c_out = c_outs[int(c_idx)];

  FragColor = vec4( c_out, 1.0 );
}