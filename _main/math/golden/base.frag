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

// *Classic Perlin 2D Noise by Stefan Gustavson (improved by Ian McEwan, Ashima Arts)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P) {
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
  float zoom = 2.250;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // uv += zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  // uv = fract(uv * 1.) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  // * CALC
  float GOLDEN_ANGLE = TAU / GOLDEN_RATIO;
  float rad = length(uv);
  float angle = atan(uv.x, uv.y);

  // * GOLDEN SPIRAL
  float spiralFactor = .5;
  float newRad = rad * (1. + spiralFactor * sin(angle * 5. - log(rad) * GOLDEN_ANGLE));

  // * remape angle from golden ratio
  float newAngle = angle + rateh + log(newRad + .1) * GOLDEN_ANGLE;

  vec2 uvGold = vec2(cos(newAngle) * newRad, sin(newAngle) * newRad);


  // ?? perm 0: Starting star

  vec3 cp1 = pal(
	smoothstep(-2.5, 2.5, cnoise(vec2(uvGold.x * 4., rateq * .13 + (u_mouse.x *.001)))) + uv.y,
	vec3(0.92, 1.00, 1.00),
	vec3(1.00, 1.00, 1.00),
	vec3(2.00, 2.00, 2.00),
	vec3(0.48, 0.70, 0.00)
  ) * pal(
    uvGold.x,
    	vec3(1.00, 1.00, 1.00),
	vec3(1.00, 1.00, 1.00),
	vec3(2.00, 2.00, 2.00),
	vec3(0.00, 1.00, 0.00)
  );

      vec3 cG = vec3(
        0.37 + 0.3 * cos(uvGold.x * 1.0),
        0.5 + 0.3 * cos(uvGold.y * 1.0 + PI/2.0),
        0.3 + 0.3 * sin((uvGold.x + uvGold.y) * 1.0)
    );

    //   vec3 cG = vec3(
    //     0.37 + 0.3 * cos(uvGold.x * 1.0),
    //     0.5 + 0.3 * cos(uvGold.y * 1.0 + PI/2.0),
    //     0.3 + 0.3 * sin((uvGold.x + uvGold.y) * 5.0)
    // );

    // vec3 cG = vec3(
    //   0.37 + 0.3 * cos(uvGold.x * 10.0)
    // );
    // vec3 cG = vec3(
    //  uvGold.x * 10.,uvGold.y * 10.,uvGold.x * 10. + uvGold.y * 10.
    // );
    // vec3 cG = vec3(
    //  uvGold.x * 10. + sin(rateq * uvGold.x * 10.),
    //  uvGold.y * 2. + sin(rateq * uvGold.y * 10.),
    //  uvGold.x * 3. + uvGold.y * 10. + sin(rateq * (uvGold.x + uvGold.y) * 10.)
    // );
    

  cp1 *= 1. - smoothstep(.8,1.5, newRad);

  
  // vec3 c_out = cG + .92 * cp1;
  // vec3 c_out = cp1;
  vec3 c_out = cG;

  // ?? perm 1: Y2k

  // vec3 cp1 = pal(
	// smoothstep(-2.5, 2.5, cnoise(vec2(uvGold.x * 4., rateq * .13 + (u_mouse.x *.001)))) + uv.y,
	// vec3(0.92, 1.00, 1.00),
	// vec3(1.00, 1.00, 1.00),
	// vec3(2.00, 2.00, 2.00),
	// vec3(0.48, 0.70, 0.00)
  // ) * pal(
  //   uvGold.x,
  //   	vec3(1.00, 1.00, 1.00),
	// vec3(1.00, 1.00, 1.00),
	// vec3(2.00, 2.00, 2.00),
	// vec3(0.00, 1.00, 0.00)
  // );

  //     vec3 cG = vec3(
  //       0.37 + 0.3 * cos(uvGold.x * 10.0),
  //       0.5 + 0.3 * cos(uvGold.y * 10.0 + PI/2.0),
  //       0.3 + 0.3 * sin((uvGold.x + uvGold.y) * 5.0)
  //   );
    

  // cp1 *= 1. - smoothstep(.8,1.5, newRad);

  
  // // vec3 c_out = cG + .92 * cp1;
  // // vec3 c_out = cp1;
  // vec3 c_out = pow(cp1,cG) + .12 * pow(cG,cp1) + (sin(cG) * (.4 * cnoise(vec2(uvGold.x * 4., rateq * .13 + (u_mouse.x *.001)))));

  // ?? perm 2: neon

  // vec3 cp1 = pal(
	// smoothstep(-2.5, 2.5, cnoise(vec2(uvGold.x * 4., rateq * .13 + (u_mouse.x *.001)))) + uv.y,
	// vec3(1.00, 1.00, 1.00),
	// vec3(1.00, 1.00, 1.00),
	// vec3(2.00, 2.00, 2.00),
	// vec3(0.00, 1.00, 0.00)
  // ) * pal(
  //   uvGold.x,
  //   	vec3(1.00, 1.00, 1.00),
	// vec3(1.00, 1.00, 1.00),
	// vec3(2.00, 2.00, 2.00),
	// vec3(0.00, 1.00, 0.00)
  // );

  //     vec3 cG = vec3(
  //       0.37 + 0.3 * cos(uvGold.x * 10.0),
  //       0.5 + 0.3 * cos(uvGold.y * 10.0 + PI/2.0),
  //       0.3 + 0.3 * sin((uvGold.x + uvGold.y) * 5.0)
  //   );
    

  // cp1 *= 1. - smoothstep(.8,1.5, newRad);

  
  // // vec3 c_out = cG + .92 * cp1;
  // // vec3 c_out = cp1;
  // vec3 c_out = pow(cp1,cG) + .12 * pow(cG,cp1) + (sin(cG) * (.4 * cnoise(vec2(uvGold.x * 4., rateq * .13 + (u_mouse.x *.001)))));
  
  // ?? perm 3: tie dye

  // vec3 cp1 = pal(
	// smoothstep(-2.5, 2.5, cnoise(vec2(uvGold.x * 4., rateq * .13 + (u_mouse.x *.001)))) + uv.y,
	// vec3(1.00, 0.30, 0.50),
	// vec3(0.30, 0.30, 0.50),
	// vec3(2.00, 0.97, 0.59),
	// vec3(0.10, 0.30, 0.70)
  // ) * pal(
  //   uvGold.x,
	// vec3(1.00, 0.30, 0.50),
	// vec3(0.30, 0.30, 0.50),
	// vec3(2.00, 0.97, 0.59),
	// vec3(0.10, 0.30, 0.70)
  // );

  //     vec3 cG = vec3(
  //       0.7 + 0.3 * cos(uvGold.x * 10.0),
  //       0.5 + 0.3 * cos(uvGold.y * 10.0 + PI/2.0),
  //       0.3 + 0.3 * sin((uvGold.x + uvGold.y) * 5.0)
  //   );
    

  // cp1 *= 1. - smoothstep(.8,1.5, newRad);

  
  // vec3 c_out = cG + .92 * cp1;
  // vec3 c_out = cp1;
  // vec3 c_out = pow(cp1,cG);
  // vec3 c_out = pow(cp1,cG) + .12 * pow(cG,cp1) + (sin(cG) * (.4 * cnoise(vec2(uvGold.x * 10., rateq * .13 + (u_mouse.x *.001)))));
  // vec3 c_out = pow(cp1,cG) + .12 * pow(cG,cp1) + (sin(cG) * (.4 * cnoise(vec2(uvGold.x * 10., rateq * .13 + (u_mouse.x *.001)))));


  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}