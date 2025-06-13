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
  float zoom = 3.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  vec2 uv1 = uv;
  vec2 uv2 = uv;
  vec2 uv3 = uv;
  vec2 uv4 = uv;
  vec2 uv5 = uv;
  vec2 uv6 = uv;
  vec2 uv7 = uv;
  vec2 uv8 = uv;
  vec2 uv9 = uv;
  vec2 uv10 = uv;
  vec2 uv11 = uv;


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
  float seg1 = 1.0 * (TAU + 6.0);
  uv1 = modPolar((uv1 * 1.0), seg1);
  float p1_1 = cnoise(uv1 * 4.0 + rateh);
  float p2_1 = cnoise(uv1 * .50 - rateh);

  vec3 c1_pre = vec3(p1_1-p2_1, p2_1-p1_1, p1_1/p2_1) * vec3(rate) * vec3(p2_1, p1_1, p1_1) / log(vec3(rate, rate - p1_1, rate)*.25);
  vec3 c1 = mix(c1_pre, vec3(0.25), p1_1 - p2_1);

  // ?? PERM 2: blue/white vs lime/green + twist!
    // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  float seg2 = 1.0 * (TAU + 6.0);
  uv2 = modPolar((uv2 * 1.0), seg2);
  uvRipple(uv2, .21 * sin(rateh), rate);
  float p1_2 = cnoise(uv2 * 4.0 + rateh);
  float p2_2 = cnoise(uv2 * 2.50 - rateh);
  vec3 c2_pre = vec3(p1_2-p2_2, p1_2, p1_2/p2_2) * vec3(rate) * vec3(p2_2, p1_2 - p2_2, p1_2) / log(vec3(rate, rate - p1_2, rate)*.25);
  vec3 c2 = mix(c2_pre, vec3(0.25), p1_2 - p2_2);

  // ?? PERM 3: rbgy vs blue/green/white (MORE RINGS, increased seg)
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  float seg3 = 2.0 * TAU + 6.0;
  uv3 = modPolar((uv3 * 1.0), seg3);
  float p1_3 = cnoise(uv3 * 5.0 + rateh);
  float p2_3 = cnoise(uv3 * .50 - rateh);
  vec3 c3_pre = vec3(p1_3-p2_3, p2_3/p1_3, p1_3+p2_3) * vec3(rate) * vec3(p2_3, p1_3 - p2_3, rate) / abs(vec3(rate, rate - p1_3, rate)*.25);
  vec3 c3 = mix(c3_pre, vec3(0.25), p1_3 - p2_3);

  // ?? PERM 4: ABS in denom, -._ multiplier adds blur and dimension + twist!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  float seg4 = 2.0 * TAU + 3.0;
  uv4 = modPolar((uv4 * 1.0), seg4);
  uvRipple(uv4, .51 * sin(rateh), rate);
  float p1_4 = cnoise(uv4 * 4.0 + rateh);
  float p2_4 = cnoise(uv4 * .50 - rateh);
  vec3 c4_pre = vec3(-.7, -.711 * p2_4 - p1_4, -.2 * p1_4-p2_4) * vec3(rate,.82*rate,rate) * vec3(p2_4, .3 * p1_4 - p2_4, rate) / abs(vec3(rate, rate - p1_4, p2_4)*.25);
  vec3 c4 = mix(c4_pre, vec3(0.25), p1_4 - p2_4);

  // ?? PERM 5: color palette + dynamic twist!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  float seg5 = 2.0 * TAU + 3.0;
  uv5 = modPolar((uv5 * 2.0), seg5);
  uvRipple(uv5, -1.11 * sin(rate), rateq);
  float p1_5 = cnoise(uv5 * 4.0 + rateh);
  float p2_5 = cnoise(uv5 * .50 - rateh);
  vec3 cp1_5 = c_palette(
     p1_5 - p2_5,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  vec3 cp2_5 = c_palette(
    .51 * p2_5 - p1_5,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  vec3 c5_pre = cp1_5 - cp2_5;
  vec3 c5 = mix(c5_pre, vec3(0.25), p1_5 - p2_5);

  // ?? PERM 6: color palette 2 
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  float seg6 = 2.0 * (PI + 6.0) + pow(rate, -2.0) + (TAU * sin(rateh));
  uv6 = modPolar((uv6 * 1.0), seg6);
  uvRipple(uv6, -.821 * sin(rateh), rateq);
  float p1_6 = cnoise(uv6 * 2.0 + rateh);
  float p2_6 = cnoise(uv6 * 2.50 - rateh);
  vec3 cp1_6 = c_palette(
     p1_6 - p2_6,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.6627, 0.6627, 0.2941), vec3(0.1255, 0.3176, 0.4235));
  vec3 cp2_6 = c_palette(
    .51 * p2_6 - p1_6,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.2275, 0.302, 0.5765), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  vec3 c6_pre = cp1_6 - cp2_6;
  vec3 c6 = mix(c6_pre, vec3(0.25), p1_6 - p2_6);

  // ?? PERM 7: groovy fire eye of sauron
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  float seg7 = 3.0 * (TAU + 6.0) + pow(rate, -2.0);
  uv7 = modPolar((uv7 * 2.0), seg7);
  float p1_7 = cnoise(uv7 * 4.0 + rateh);
  float p2_7 = cnoise(uv7 * .50 - rateh);
  vec3 cp1_7 = c_palette(
     p1_7 - p2_7,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.6627, 0.6627, 0.2941), vec3(0.1255, 0.3176, 0.4235));
  vec3 cp2_7 = c_palette(
    .51 * p2_7 - p1_7,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.2275, 0.302, 0.5765), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  vec3 c7_pre = cp1_7 - cp2_7 * abs(vec3(uv7.y, .1, uv7.y));
  vec3 c7 = mix(c7_pre, vec3(0.25), p1_7 - p2_7);
  
  // ***************************************************** !!!!!! winner
  // ?? PERM 8: blue fire + twist!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  float seg8 = 1.40 * (TAU + 2.0) + pow(rate, -2.0);
  // float seg8 = .01;
  uv8 = modPolar((uv8 * 1.10), seg8);
  uvRipple(uv8, -.21 * sin(rateh), rate);
  float p1_8 = cnoise(uv8 * 2.0 + rateh);
  float p2_8 = cnoise(uv8 * .50 - rateh);
  vec3 cp1_8 = c_palette(
     p1_8 - p2_8,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.6627, 0.6627, 0.2941), vec3(0.1255, 0.3176, 0.4235));
  vec3 cp2_8 = c_palette(
    p2_8 + uv8.y / p1_8 - uv8.x,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.2275, 0.302, 0.5765), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
  vec3 c8_pre = cp1_8 / abs(cp2_8);
  vec3 c8 = mix(c8_pre, vec3(0.25), p1_8);


  // ?? PERM 9: blue fire + twist + WARP!
  // * subperm: exp makes noisy sandy rings
  // *, log zooms in
  // *, fract creates groovy spiral
  // !! abs(vec3(rate, rate - p1, p2)*2001.5) , creates rocket fuel artifacts
  uv9 = fract(uv9 * 1.) - 0.5;
  float seg = 1.40 * (TAU + 2.0) + pow(rate, -2.0);
  // float seg = .01;
  uv9 = modPolar((uv9 * 1.10), seg);
  uvRipple(uv9, -.21 * sin(rateh), rate);

  float p1_9 = cnoise(uv9 * 2.0 + rateh);
  float p2_9 = cnoise(uv9 * .50 - rateh);
  vec3 cp1_9 = c_palette(
     p1_9 - p2_9,
    vec3(0.1098, 0.0118, 0.0118), vec3(0.2275, 0.502, 0.5765), vec3(0.1333, 0.1804, 0.3765), vec3(0.8706, 0.8706, 0.8706));
  vec3 cp2_9 = c_palette(
    p2_9 + uv9.y / p1_9 - uv9.x,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5647, 0.2275, 0.5765), vec3(0.5882, 0.3961, 0.5176), vec3(0.3098, 0.1255, 0.4235));
  vec3 c9_pre = cp1_9 / abs(cp2_9);
  coswarp(c1, uv9.x);
  vec3 c9 = mix(c9_pre, vec3(0.15), cp1_9);

  // ??? PERM 10: emerald
  // uv9 = fract(uv9 * 1.) - 0.5;
  float seg10 = 1.40 * (TAU + 2.0) + pow(rate, 1.0);
  // float seg = .01;
  uv10 = modPolar((uv10 * 1.10), seg10);
  uvRipple(uv10, -.21 / atan(rateh), rate);

  float p1_10 = cnoise(uv10 * 2.0 + rateh);
  float p2_10 = cnoise(uv10 * .50 - rateh);
  vec3 cp1_10 = c_palette(
     p1_10 - p2_10,
    vec3(0.098, 0.118, 0.0118), vec3(0.2275, 0.502, 0.5765), vec3(0.1333, 0.1804, 0.3765), vec3(0.8706, 0.8706, 0.8706));
  vec3 cp2_10 = c_palette(
    p2_10 + uv9.y / p1_10 - uv9.x,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5647, 0.2275, 0.5765), vec3(0.5882, 0.3961, 0.5176), vec3(0.3098, 0.1255, 0.4235));
  vec3 c10_pre = cp1_10 / abs(cp2_10);
  coswarp(c9, uv10.y);
  vec3 c10 = mix(c10_pre, vec3(.15), uv10.x);

  // ??? PERM 11: outlines
  // uv9 = fract(uv9 * 1.) - 0.5;
  float seg11 = .40 * (TAU + 2.0) / pow(rate, -2.0);
  // float seg = .01;
  uv11 = modPolar((uv11 * 1.10), seg11);
  uvRipple(uv11, -.21 / atan(rateh), rate);

  float p1_11 = cnoise(uv11 * 2.0 + rateh);
  float p2_11 = cnoise(uv11 * .50 - rateh);
  vec3 cp1_11 = c_palette(
     p1_11 - p2_11,
    vec3(0.098, 0.118, 0.0118), vec3(0.2275, 0.502, 0.5765), vec3(0.1333, 0.1804, 0.3765), vec3(0.8706, 0.8706, 0.8706));
  vec3 cp2_11 = c_palette(
    p2_11 + uv9.y / p1_11 - uv9.x,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5647, 0.2275, 0.5765), vec3(0.5882, 0.3961, 0.5176), vec3(0.3098, 0.1255, 0.4235));
  vec3 c11_pre = cp1_11 / abs(cp2_11);
  coswarp(c9, uv11.y);
  vec3 c11 = mix(c11_pre, -log(c1_pre), uv11.x);


  vec3 a1[11] = vec3[11](
    c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11
  );

  float cycle_speed = rateq * .25;
  int a1_idx = int(mod(cycle_speed, 11.0)); // Modulo cycles between 0, 1, 2...etc over time
  float num_traversals = floor(cycle_speed); 
  vec3 a_out1 = a1[int(a1_idx)];
  int next_idx = int(mod(cycle_speed + 1.0, 11.0));  
  int last_idx = int(mod(cycle_speed - 1.0, 11.0));  
  
  // vec3 c_out = c10;
  
  // vec3 c_out = mix(c1, vec3(0.25), p1 - p2);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  float fade_duration = 0.1;  // 0.15s fade in/out  

  float index_time = fract(cycle_speed); 
  bool is_fade_out = (index_time > (1.0 - fade_duration));  
  bool is_fade_in = (index_time < fade_duration);  

  // Compute alpha (1.0 = fully visible, 0.0 = fully transparent)  
float alpha;
vec3 c_out;
if (is_fade_out) {  
    // Fade out: alpha decreases from 1.0 to 0.0 over the last 0.15s  
      float t = smoothstep(1.0 - fade_duration, 1.0, index_time);  
    alpha = 1.5 - t;  
    vec3 next_color = a1[next_idx];  
    c_out = mix(a_out1, next_color, t);  // Optional: Blend colors     
} else if (is_fade_in) {  
    // Fade in: alpha increases from 0.0 to 1.0 over the first 0.15s  
    float t = smoothstep(0.0, fade_duration, index_time); 
  alpha = .5 + t;  
  vec3 last_color = a1[last_idx];  
  c_out = mix(a_out1, a_out1 - last_color, t);  // Optional: Blend colors 
} else {  
    // Fully visible in the middle of the index duration  
    alpha = 1.0;  

  c_out = a_out1;
}  

  FragColor = vec4(c_out, alpha);
}