#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex;
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
  float b = random2d(i + vec2(1.0, 0.0),0.0);
  float c = random2d(i + vec2(0.0, 1.0),0.0);
  float d = random2d(i + vec2(1.0, 1.0),0.0);
  // Smooth Interpolation

  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f*f*(3.0-2.0*f);
  // u = smoothstep(0.,1.,f);

  // Mix 4 coorners percentages
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main(){
  float zoom = 0.5;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  uv += vec2(1.75, 0.5);
 
  // *noise
  // vec2 pos = vec2(uv*12.0);
  // pos.y -= u_u_time * 1.5;

  // float n = noise(pos);
  // pos = vec2(
  //   uv.x*0.5-0.033,
  //   uv.y*2.0-u_u_time*0.12
  // );
  // n += noise(pos*8.0);
  // pos = vec2(
  //   uv.x*0.94-0.02,
  //   uv.y*3.0-u_u_time*0.61
  // );
  // n += noise(pos*4.0);
  // n /= 5.0;
  // Generate noisy y value
  vec2 noise = vec2(0.0);
  // Generate noisy x value
  uv = vec2(uv.x*1.4 + 0.01, fract(uv.y - u_time*0.069));
  noise.x = (texture2D(u_tex, uv*0.5).w-0.5)*2.0;
  uv = vec2(uv.x*0.5 - 0.033, fract(uv.y*2.0 - u_time*0.12));
  noise.x += (texture2D(u_tex, uv).w-0.5)*2.0;
  uv = vec2(uv.x*0.94 + 0.02, fract(uv.y*3.0 - u_time*0.061));
  noise.x += (texture2D(u_tex, uv).w-0.5)*2.0;
  
  // Generate noisy y value
  uv = vec2(uv.x*0.7 - 0.01, fract(uv.y - u_time*0.027));
  noise.y = (texture2D(u_tex, uv).w-0.5)*2.0;
  uv = vec2(uv.x*0.45 + 0.033, fract(uv.y*1.9 - u_time*0.061));
  noise.y = (texture2D(u_tex, uv).w-0.5)*2.0;
  uv = vec2(uv.x*0.8 - 0.02, fract(uv.y*2.5 - u_time*0.051));
  noise.y += (texture2D(u_tex, uv).w-0.5)*2.0;
  
  noise = clamp(noise, -1.0, 1.0);

  float perturb = (1.0 - uv.y) * 0.35 + 0.02;
  noise = (noise * perturb) + uv - 0.02;

  vec4 color = texture2D(u_tex, noise);
  color = vec4(color.r*2.0, color.g*0.9, (color.g/color.r)*0.2, 1.0);
  noise = clamp(noise, 0.0, 0.5);
  color.a = texture2D(u_tex, noise).b*100000.0;
  color.a = color.a*texture2D(u_tex, uv).b;
  
  // vec3 c1 = c_palette(
  //   n,
  //   vec3(0.5, 0.5, 0.0), vec3(0.5, 0.5, 0.0), vec3(0.1, 0.5, 0.0), vec3(0.0, 0.0, 0.0)
  // );

  // vec3 c_out = c1;
  // FragColor = texture2D(u_tex, uv);
  FragColor = color;
} 