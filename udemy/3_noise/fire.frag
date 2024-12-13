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
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);

  // *noise
  vec2 pos = vec2(uv*12.0);
  pos.y -= u_time * 1.5;

float flicker = clamp(abs(0.2*sin((u_time * random2d(uv * 0.0000001, u_time / 0.00002)))), 0.0, 0.2);
  float n = noise(pos);
  pos = vec2(
    uv.x*0.5-0.033,
    uv.y*2.0-u_time*0.12
  );
  n += noise(pos*8.0);
  pos = vec2(
    uv.x*0.94-0.02+flicker,
    uv.y*3.0-u_time*0.61
  );
  n += noise(pos*4.0);
  n /= 5.0;

  
  vec3 c1 = c_palette(
    n,
    vec3(0.5, 0.5 + flicker, 0.0 + flicker), vec3(0.5, 0.5, 0.0), vec3(0.1, 0.5, 0.0), vec3(0.0, 0.0, 0.0 + flicker)
  );
  vec3 c2 = c_palette(
    n,
    vec3(0.2039, 0.0745, 0.0235),vec3(0.098, 0.0118, 0.0392),vec3(0.2706, 0.4706, 0.0706),vec3(0.3843, 0.3843, 0.0314)
  );
  vec3 c_out = c1;
  FragColor = vec4(c_out, 1.0);
} 