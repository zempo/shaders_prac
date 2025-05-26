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


// Prime modulus - try 7, 13, 19 for different patterns
#define PRIME 19
#define TILE_SIZE 16.0     // Number of tiles across screen
// ! makes tv screen
// #define TILE_SIZE 106.0     // Number of tiles across screen

void main(){
  float zoom = 1.0;
  // vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y) / TILE_SIZE;
  //for textures, use below
  vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy) / TILE_SIZE;
  vec2 uv_c1 = 2. * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

        // Unique seed based on tile position
    float seed = dot(uv, vec2(12.9898, 78.233));

        // Time progression with prime rhythm
    float timeStep = 1.; // Discrete time steps
    timeStep += floor(rated * 5.); // Discrete time steps
    // timeStep += fract(uv.x * cos(floor(rateq * .10))); // Discrete time steps
    // timeStep *= fract(uv.y * sin((rate))); // Discrete time steps
    float cycle = mod(timeStep, float(PRIME)); // Cycle through states

     // Base state (position-derived)
    float state = mod(seed, float(PRIME));
    
    // Simulate neighbor influence (4-way connectivity)
    float neighborSum = 0.0;
    neighborSum += mod(seed + 1.0, float(PRIME)); // Right neighbor
    neighborSum += mod(seed - 1.0, float(PRIME)); // Left neighbor
    neighborSum += mod(seed + 100.0, float(PRIME)); // Top neighbor (arbitrary offset)
    neighborSum += mod(seed - 100.0, float(PRIME)); // Bottom neighbor
    
    // Apply protofield operator rules
    float newState = mod(state + neighborSum + cycle, float(PRIME));
    
    // Color mapping - creates evolving pattern
    vec3 c1;
    float normState = newState / float(PRIME);
    
    // Tri-c1 pattern with phase shifts
    // c1.r = abs(sin(normState * PI));
    // c1.g = abs(cos(normState * PI * 1.618)) * sin(rate);
    // c1.b = abs(sin(normState * PI * 0.618));

    // float p1_example = uv.x - 0.5;			

      float angle = u_time * 0.01;
  for (int i = 0; i < 10; i++){
    uv_c1 = abs(uv_c1);
    uv_c1 -= .5;
    uv_c1 *= 1.;
    uv_c1 *= mat2(
      cos(angle), -sin(angle),
      sin(angle), cos(angle)  
    );
  } 
  

    vec3 cp1 = pal(
	  abs(sin(normState * TAU)) / length(uv - vec2(0.5)),
	vec3(0.92, 1.00, 1.00),
	vec3(1.00, 1.00, 1.00),
	  vec3(2.00, 2.00, 2.00),
	vec3(0.48, 0.70, 0.00)
);

 vec3 cp2 = vec3(
  length(uv_c1 + vec2(.0,.75)),
  length(uv_c1 + vec2(.2,.75)),
  length(uv_c1 + vec2(.4,.75))
);

        // Add some gradient within tiles
    vec2 pixelPos = fract(gl_FragCoord.xy / (u_resolution.xy / TILE_SIZE));
    // c1 *= 0.8 + 0.2 * sin(pixelPos.x * PI - rate) * sin(pixelPos.y * PI + rate);
    cp1 *= 0.8 + 0.2 * sin(pixelPos.x * PI - rate) * sin(pixelPos.y * PI + rate);
    cp2 *= 0.8 + 0.2 * sin(pixelPos.x * PI - rate) * sin(pixelPos.y * PI + rate);
    
  // vec3 c_out = c1;
  // uv *= TILE_SIZE * 0.5;
  // vec3 c_out = mix(cp1, cp2, 5.15 * sin(rate * pixelPos.x));
  vec3 c_out = cp1 * cp2;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}