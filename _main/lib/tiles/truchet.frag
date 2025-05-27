#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
//uniform sampler2D u_tex;
out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
const float PHI = 1.61803398874989484820458683436564;
const float GAMMA = 0.57721566490153286060651209008240243;
const float GOLDEN_RATIO = 1.61803398874989484820458683436564;
// http://dev.thi.ng/gradients/
vec3 pal( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float line(float x, float y, float line_width, float edge_width){
  return smoothstep(x-line_width/2.0-edge_width, x-line_width/2.0, y) - smoothstep(x+line_width/2.0, x+line_width/2.0+edge_width, y);
}

// *Classic Perlin 2D Noise by Stefan Gustavson (improved by Ian McEwan, Ashima Arts)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Rotates a 2D point by angle (in radians)
vec2 rotate(vec2 uv, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c) * uv;
}

float truchetPattern(vec2 uv, float seed) {
  float rot = floor(mod(seed, 4.0)) * (PI / 2.0);

  uv = rotate(uv, rot);

  float d = min(
    length(uv - vec2(.5, .5)),
    abs(uv.x + uv.y - 1.0)
  );

  return d;
}

/**
  vec3 t1 = texture2D(u_tex, uv).rgb;
  vec3 c1 = vec3(0.4, 0.3686, 0.3373); // backgrond
  float t_adjust = inRect(uv, vec2(0.0),vec2(1.0));
  vec3 c_out = mix(c1, t1 - t2 * 0.25, t_adjust);
*/ 
float inRect (vec2 pt, vec2 btmL, vec2 topR) {
  vec2 s = step(btmL, pt) - step(topR, pt);
  return s.x * s.y;
}

void main(){
  float zoom = 1.5;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  // ??? "+ .1" is a hack to avoid zero division and ugly lines
  vec2 uv_ID = cos((uv * TAU) * uv.x + .1); // ID for each tile
  uv_ID *= sin((uv * TAU) * uv.y + .1); // ID for each tile

  uv_ID = fract(cos(uv_ID * 2.0)) - 0.5; // Subdivide UV space into tiles

  float seed = dot(uv_ID, vec2(12.9898, 78.233));
  seed = mod(seed + rateh, 7.0); // Unique seed based on tile position

  // generate truchet pattern
  float p1 = truchetPattern(uv_ID, seed);

  float threshold = 0.25 + (.2 * sin(rated)); // Threshold to determine color


  // ??? PERM 0: default black and white (diluted somewhat)
  // vec3 c1 = vec3(smoothstep(threshold - 0.1, threshold, p1));
  // c1.r *= mod(seed,2.) / 1.0; // Vary red channel based on seed
  // c1.g *= mod(seed,2.) / 1.0; // Vary red channel based on seed
  // c1.b *= mod(seed,2.) / 1.0; // Vary red channel based on seed

  // ??? PERM 1: blue / green / purple / orange (owl-ish colors)
  // vec3 c1 = vec3(smoothstep(threshold - 0.1, threshold, p1));
  // c1.r *= mod(seed, 3.) / 3.0; // Vary red channel based on seed
  // c1.g *= mod(seed, PI / 2.) / 2.; // Vary red channel based on seed
  // c1.b *= mod(seed, PI / 3.) / 1.0; // Vary red channel based on seed

  // ??? PERM 2: red / blue / purple
  // vec3 c1 = vec3(smoothstep(threshold - 0.1, threshold, p1));
  // c1.r *= mod(seed,TAU) / 3.0; // Vary red channel based on seed
  // c1.g *= mod(seed,.5) / 3.0; // Vary red channel based on seed
  // c1.b *= mod(seed,PI) / 2.0; // Vary red channel based on seed

  // ??? PERM 3: alvioli
//  threshold = 0.25 + (.2 * sin(rateh)); // Threshold to determine color
//   vec3 c1 = vec3(smoothstep(threshold / 0.5, threshold, p1));
//   c1.r -= mod(seed, 3.) / 3.0; // Vary red channel based on seed
//   c1.g -= mod(seed, PI / 2.) / 2.; // Vary red channel based on seed
//   c1.b -= mod(seed, PI / 3.) / 1.0; // Vary red channel based on seed

  // ??? PERM 4: UV jellyfish
  vec3 c1 = vec3(smoothstep(cos(threshold), atan(threshold), pow(p1, 3.3)));
  c1.r -= mod(seed, TAU) / 1.0; // Vary red channel based on seed
  c1.g *= mod(seed, PI / 2.) / 2.; // Vary red channel based on seed
  c1.b -= mod(seed, PI / 3.) / 1.0 - abs(sin(rateq)); // Vary red channel based on seed

  vec3 c_out = c1;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}