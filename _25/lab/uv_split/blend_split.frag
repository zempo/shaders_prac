#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform vec2 u_mouse;
uniform sampler2D u_tex;
out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
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

float gyroid(vec3 p) {
  return dot(cos(p), sin(p.yxz));
}

// fbm (fractal brownian motion) 
float fbm(vec3 p, float rate_mult) {
  float result = 0.0;
  float a = 0.5;

  float rate_local = u_time * rate_mult;

  float lim = 7.0;
  for(float i = 0.0; i < lim; ++i){
    p += result * .1;
    p.z += rate_local;
    result += abs(gyroid(p / a) * a);
    a /= 1.7;
  }
  return result;
}

vec3 getCellColor(int cellID, vec2 uv, vec2 uvP, vec3 t1, float p1) {
    // Simplify time calculations - only use what's needed
    float rateq = u_time * 0.25;
    
    // Safer mix value calculation
    float mix_v = abs(log(max(t1.b * t1.r, 1.1)));
    vec3 brightness = 0.75 + (0.13 * vec3(uv.y, uv.x, uv.y));

    // Base color palettes (declare up front)
    vec3 cp1, cp2, c;
    
    // Cell-specific color definitions
    if (cellID == 0) {
        cp1 = pal(
            cnoise((uv * 1.2 + rateq)) + p1,
            vec3(0.30, 0.30, 0.50),
            vec3(0.30, 0.30, 0.50),
            vec3(0.80, 0.80, 0.50),
            vec3(0.10, 0.30, 0.70)
        );

        cp2 = pal(
            cnoise((uv * 1.2 + rateq * 0.1)) + p1,
            vec3(1.00, 1.00, 1.00),
            vec3(1.00, 1.00, 1.00),
            vec3(2.00, 2.00, 2.00),
            vec3(0.1 - cos(rateq), 1.00, 0.01 - sin(rateq))
        );

        c = mix(cp2, cp1, mix_v) * brightness;

    } else if (cellID == 1) {
        cp1 = pal(
            cnoise((uv * 1.2 + rateq)) + p1,
            vec3(1.00, 1.00, 1.00),
            vec3(1.00, 1.00, 1.00),
            vec3(2.00, 2.00, 2.00),
            vec3(0.01, 1.00, 0.00)
        );

        cp2 = pal(
            cnoise((uv * 1.2 + rateq * 0.1)) + p1,
            vec3(0.50, 0.50, 0.50),
            vec3(0.50, 0.50, 0.50),
            vec3(1.00, 1.00, 1.00),
            vec3(0.00, 0.33, 0.67)
        );

        c = mix(cp2, cp1, mix_v) * brightness;

    } else if (cellID == 2) {
        // Fixed: Actually mix two different colors
        cp1 = pal(
            cnoise((uv * 1.2 + rateq)) + p1,
            vec3(0.80, 0.50, 0.40),
            vec3(0.20, 0.40, 0.20),
            vec3(2.00, 1.00, 1.00),
            vec3(0.50, 0.20, 0.25)
        );

        cp2 = pal(
            cnoise((uv * 1.2 + rateq * 0.5)) + p1,
            vec3(0.30, 0.60, 0.20),
            vec3(0.20, 0.40, 0.20),
            vec3(1.00, 1.00, 1.00),
            vec3(0.20, 0.50, 0.30)
        );

        c = mix(cp1, cp2, mix_v) * brightness;

    } else if (cellID == 3) {
        cp1 = pal(
            cnoise((uv * 1.2 + rateq)) + p1,
            vec3(1.00, 0.97, 1.00),
            vec3(0.30, 0.30, 0.50),
            vec3(0.80, 0.80, 0.50),
            vec3(0.10, 0.30, 0.70)
        );

        cp2 = pal(
            cnoise((uv * 1.2 + rateq * 0.1)) + p1,
            vec3(0.50, 0.50, 0.50),
            vec3(0.50, 0.50, 0.50),
            vec3(1.00, 1.00, 1.00),
            vec3(0.00, 0.33, 0.67)
        );

        c = mix(cp2, cp1, mix_v) * brightness;

    } else if (cellID == 4) {
        cp1 = pal(
            cnoise((uv * 1.2 + rateq)) + p1,
            vec3(0.80, 0.50, 0.40),
            vec3(0.20, 0.40, 0.20),
            vec3(2.00, 1.00, 1.00),
            vec3(0.50, 0.20, 0.25)
        );

        cp2 = pal(
            cnoise((uv * 1.2 + rateq * 0.1)) + p1,
            vec3(0.98, 0.95, 0.40),
            vec3(0.20, 0.40, 0.20),
            vec3(0.50, 0.50, 0.50),
            vec3(0.50, 0.20, 0.25)
        );

        c = mix(cp2, cp1, mix_v) * brightness;

    } else {  // cellID == 5
        // Fixed: Remove color division which could cause NaN/Infinity
        brightness = 0.25 + (0.13 * vec3(uv.y, uv.x, uv.y));
        
        cp1 = pal(
            cnoise((uv * 1.2 + rateq)) + p1,
            vec3(0.30, 0.30, 0.50),
            vec3(0.30, 0.30, 0.50),
            vec3(0.80, 0.80, 0.50),
            vec3(0.10, 0.30, 0.70)
        );

        cp2 = pal(
            cnoise((uv * 1.2 + rateq * 0.1)) + p1,
            vec3(1.00, 1.00, 1.00),
            vec3(1.00, 1.00, 1.00),
            vec3(2.00, 2.00, 2.00),
            vec3(0.00, 1.00, 0.50)
        );

        c = mix(cp2, cp1, mix_v) * brightness;
    }

    return c;
}

void main(){
    // Setup
    float zoom = 1.0;
    vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
    vec3 t1 = texture2D(u_tex, uv).rgb;

    float rateh = u_time * 0.5;
    float rateq = u_time * 0.25;
    
    // Grid setup (3x2)
    uv = uv * vec2(3.0, 2.0);
    int cellX = int(floor(uv.x));
    int cellY = int(floor(uv.y));
    int cellID = cellX + cellY * 3;
    vec2 uvC = fract(uv);
    vec2 uvP = fract(uv * vec2(2., 3.));

      vec3 c1 = vec3(uv.y*4., (rateq * .25) + uv.y*.34, uv.x*2.);
  float p1 = fbm(c1, 0.01);
    
    // Calculate blend factors
    float blendZone = 0.1;
    vec2 edgeDist = min(uvC, 1.0 - uvC);
    vec2 blendFactor = smoothstep(vec2(0.0), vec2(blendZone), edgeDist);
    
    // Get colors for current and neighboring cells
    vec3 c_center = getCellColor(cellID, uvC, uvP, t1, p1);
    vec3 c_right = getCellColor((cellX + 1) % 3 + cellY * 3, uvC + vec2(1.0, 0.0), uvP, t1, p1);
    vec3 c_top = getCellColor(cellX + ((cellY + 1) % 2) * 3, uvC + vec2(0.0, 1.0), uvP, t1, p1);
    vec3 c_top_right = getCellColor((cellX + 1) % 3 + ((cellY + 1) % 2) * 3, uvC + vec2(1.0, 1.0), uvP, t1, p1);
    
    // Final blending (with explicit float conversion)
    vec3 horizontal_blend = mix(c_center, c_right, blendFactor.x);
    vec3 vertical_blend = mix(c_top, c_top_right, blendFactor.x);
    vec3 final_color = mix(horizontal_blend, vertical_blend, blendFactor.y);
    
    FragColor = vec4(final_color, 1.0);
}