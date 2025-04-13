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

// Hash function for randomness
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Time-stable randomness
float timeHash(vec2 p, float t) {
    // Discrete time steps to stabilize changes (e.g., every 3 seconds)
    float interval = 3.0;
    float tStep = floor(t / interval);
    return hash(p + tStep);
}

// Palette interpolation
// Smooth shifting color palette over time
vec3 palette(float t) {
    vec3 c1 = vec3(0.2, 0.0, 0.4);  // purple
    vec3 c2 = vec3(0.8, 0.4, 0.3);  // coral
    vec3 c3 = vec3(0.9, 0.85, 0.8); // cream
    vec3 c4 = vec3(0.3, 0.4, 0.8);  // blue

    // Animate t cyclically using a sine wave
    // float animatedT = fract(t + 0.25 * sin(timeShift * 0.2));

    if (t < 0.33) return mix(c1, c4, t / 0.33);
    else if (t < 0.66) return mix(c4, c3, (t - 0.33) / 0.33);
    else return mix(c3, c2, (t - 0.66) / 0.34);
    // if (animatedT < 0.33) return mix(c1, c4, animatedT / 0.33);
    // else if (animatedT < 0.66) return mix(c4, c3, (animatedT - 0.33) / 0.33);
    // else return mix(c3, c2, (animatedT - 0.66) / 0.34);
}

float triangle(vec2 uv, float flip) {
  return flip < 0.5 ? step(uv.x, uv.y) : step(uv.y, uv.x);
}

mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}


void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // float rate = u_time * 12.0;
  float rate0 = u_time * .01;
  float rate = u_time * 8.0;

    // Number of tiles in the grid
    float gridSize = 20.0;
    float subdiv = 4.0;
    vec2 gridUV = uv * gridSize;
    gridUV = rotate(PI*rate0) * gridUV;


    vec2 id = floor(gridUV);
    vec2 id_inv = ceil(gridUV);
    vec2 local = fract(gridUV);
    vec2 local_inv = fract(gridUV);

    // Randomize triangle orientation per cell
    float flip = timeHash(id, rate);

    // Randomized rotation/flipping
    if (timeHash(id + 0.1,rate) > 0.5) local = vec2(1.0) - local;
    if (timeHash(id + 0.7,rate) > 0.5) local = local.yx;
    if (timeHash(id + 0.1,rate) > 0.5) local_inv = local.yx;
    if (timeHash(id + 0.7,rate) > 0.5) local_inv = vec2(1.0) - local;

    float shape = triangle(local, flip);
    float shape_inv = triangle(local_inv, flip);

    // Use position to influence palette
    float fx = id.x / gridSize;
    float fy = id.y / gridSize;
    float fx_inv = id_inv.x / gridSize;
    float fy_inv = id_inv.y / gridSize;
    vec3 color = palette(fx * fy);
    vec3 color_inv = palette(fx_inv * fy_inv);
    // vec3 color_inv = palette(fx_inv * fy_inv) * palette(local.x * local_inv.y);
    // vec3 color = palette(fx * fy) * palette(local.x * local.y);

    // Mix with background
    vec3 bg = vec3(0.02);
    vec3 final = mix(color_inv, color, shape);
  
  vec3 c1 = vec3(1.0);
  vec3 c_out = final;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}