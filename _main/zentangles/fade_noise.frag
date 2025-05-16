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

// *Classic Perlin 2D Noise by Stefan Gustavson
vec4 permute(vec4 x) {
  return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}



void main(){
  float zoom = 3.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  // uv = fract(uv * 2.) - 0.5;

  float rate = u_time * 1.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  // ??? base citrusy: vec3(p1+p2, p2-p1, p1-p2)

  // ??? PERM 1: blue purple vs. green red 
    // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // float seg = 1.0 * (TAU + 6.0);
  // uv = modPolar((uv * 1.0), seg);
  // float p1 = cnoise(uv * 4.0 + rateh);
  // float p2 = cnoise(uv * .50 - rateh);
  // vec3 c1 = vec3(p1-p2, p2-p1, p1/p2) * vec3(rate) * vec3(p2, p1, p1) / log(vec3(rate, rate - p1, rate)*.25);

  // ?? PERM 2: blue/white vs lime/green + twist!
    // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // float seg = 1.0 * (TAU + 6.0);
  // uv = modPolar((uv * 1.0), seg);
  // uvRipple(uv, .21 * sin(rateh), rate);
  // float p1 = cnoise(uv * 4.0 + rateh);
  // float p2 = cnoise(uv * 2.50 - rateh);
  // vec3 c1 = vec3(p1-p2, p1, p1/p2) * vec3(rate) * vec3(p2, p1 - p2, p1) / log(vec3(rate, rate - p1, rate)*.25);

  // ?? PERM 3: rbgy vs blue/green/white (MORE RINGS, increased seg)
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // float seg = 2.0 * TAU + 6.0;
  // uv = modPolar((uv * 1.0), seg);
  // float p1 = cnoise(uv * 5.0 + rateh);
  // float p2 = cnoise(uv * .50 - rateh);
  // vec3 c1 = vec3(p1-p2, p2/p1, p1+p2) * vec3(rate) * vec3(p2, p1 - p2, rate) / abs(vec3(rate, rate - p1, rate)*.25);

  // ?? PERM 4: ABS in denom, -._ multiplier adds blur and dimension + twist!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  // float seg = 2.0 * TAU + 3.0;
  // uv = modPolar((uv * 1.0), seg);
  // uvRipple(uv, .51 * sin(rateh), rate);
  // float p1 = cnoise(uv * 4.0 + rateh);
  // float p2 = cnoise(uv * .50 - rateh);
  // vec3 c1 = vec3(-.7, -.711 * p2 - p1, -.2 * p1-p2) * vec3(rate,.82*rate,rate) * vec3(p2, .3 * p1 - p2, rate) / abs(vec3(rate, rate - p1, p2)*.25);

  // ?? PERM 5: color palette + dynamic twist!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  // float seg = 2.0 * TAU + 3.0;
  // uv = modPolar((uv * 2.0), seg);
  // uvRipple(uv, -1.11 * sin(rate), rateq);
  // float p1 = cnoise(uv * 4.0 + rateh);
  // float p2 = cnoise(uv * .50 - rateh);
  // vec3 cp1 = c_palette(
  //    p1 - p2,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  // vec3 cp2 = c_palette(
  //   .51 * p2 - p1,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  // vec3 c1 = cp1 - cp2;

  // ?? PERM 5: color palette 2 
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  // float seg = 2.0 * (PI + 6.0) + pow(rate, -2.0) + (TAU * sin(rateh));
  // uv = modPolar((uv * 1.0), seg);
  // uvRipple(uv, -.821 * sin(rateh), rateq);
  // float p1 = cnoise(uv * 2.0 + rateh);
  // float p2 = cnoise(uv * 2.50 - rateh);
  // vec3 cp1 = c_palette(
  //    p1 - p2,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.6627, 0.6627, 0.2941), vec3(0.1255, 0.3176, 0.4235));
  // vec3 cp2 = c_palette(
  //   .51 * p2 - p1,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.2275, 0.302, 0.5765), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  // vec3 c1 = cp1 - cp2;

  // ?? PERM 6: groovy fire eye of sauron
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  // float seg = 3.0 * (TAU + 6.0) + pow(rate, -2.0);
  // uv = modPolar((uv * 2.0), seg);
  // float p1 = cnoise(uv * 4.0 + rateh);
  // float p2 = cnoise(uv * .50 - rateh);
  // vec3 cp1 = c_palette(
  //    p1 - p2,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.6627, 0.6627, 0.2941), vec3(0.1255, 0.3176, 0.4235));
  // vec3 cp2 = c_palette(
  //   .51 * p2 - p1,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.2275, 0.302, 0.5765), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  // vec3 c1 = cp1 - cp2 * abs(vec3(uv.y, .1, uv.y));
  
  // ***************************************************** !!!!!! winner
  // ?? PERM 7: blue fire + twist!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  // float seg = 1.40 * (TAU + 2.0) + pow(rate, -2.0);
  // // float seg = .01;
  // uv = modPolar((uv * 1.10), seg);
  // uvRipple(uv, -.21 * sin(rateh), rate);
  // float p1 = cnoise(uv * 2.0 + rateh);
  // float p2 = cnoise(uv * .50 - rateh);
  // vec3 cp1 = c_palette(
  //    p1 - p2,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.6627, 0.6627, 0.2941), vec3(0.1255, 0.3176, 0.4235));
  // vec3 cp2 = c_palette(
  //   p2 + uv.y / p1 - uv.x,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.2275, 0.302, 0.5765), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  // vec3 c1 = cp1 / abs(cp2);
    // vec3 c_out = mix(c1, vec3(0.25), p1);


  // ?? PERM 8: blue fire + twist + WARP!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  uv = fract(uv * 1.) - 0.5;
  float seg = 1.40 * (TAU + 2.0) + pow(rate, -2.0);
  // float seg = .01;
  uv = modPolar((uv * 1.10), seg);
  uvRipple(uv, -.21 * sin(rateh), rate);

  float p1 = cnoise(uv * 2.0 + rateh);
  float p2 = cnoise(uv * .50 - rateh);
  vec3 cp1 = c_palette(
     p1 - p2,
    vec3(0.1098, 0.0118, 0.0118), vec3(0.2275, 0.502, 0.5765), vec3(0.1333, 0.1804, 0.3765), vec3(0.8706, 0.8706, 0.8706));
  vec3 cp2 = c_palette(
    p2 + uv.y / p1 - uv.x,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5647, 0.2275, 0.5765), vec3(0.5882, 0.3961, 0.5176), vec3(0.3098, 0.1255, 0.4235));
  vec3 c1 = cp1 / abs(cp2);
  // coswarp(c1, uv.x);
    // vec3 c_out = mix(c1, vec3(0.15), cp1);


  
  vec3 c_out = mix(c1, vec3(0.25), p1 - p2);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}