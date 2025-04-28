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

vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}



vec2 rotateTilePattern(vec2 _st){

    //  Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // Rotate each cell according to the index
    if(index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st,PI);
    }

    return _st;
}


void main(){
  float zoom = 1.0;
  // vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  //  !!!! uses specific resolution to avoid y-distortion
  vec2 uv = zoom * (gl_FragCoord.xy - u_resolution * .5) / u_resolution.yy + 0.5;
    vec2 uv2 = uv;
   vec2 uv3 = uv;
  //for textures, use below

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;


  float t = (u_time * .2) + length(uv2 - .5);

  vec3 c_init = vec3(1.);
  uv = rotateTilePattern(uv);

  c_init = mix(c_init, 1.-c_init, step(length(uv-.1), .1));
  c_init = mix(c_init, 1.-c_init, step(uv.x, .1)-step(uv.x, .05));
  c_init = mix(c_init, 1.-c_init, step(uv.y, .1)-step(uv.y, .05));
  
  
//    c_init = mix(c_init, 1.-c_init, step(uv2.x-.5 + uv2.y-.5, .1) - step(uv2.x-.5 + uv2.y-.5, .05));
//   c_init = mix(c_init, 1.-c_init, 
//     step(uv2.x - uv2.y, .1) -  // Changed to subtraction
//     step(uv2.x - uv2.y, .05)   // Creates a top-right to bottom-left band
// );

float posBand = step(abs(uv2.x - .5 + uv2.y - .5), 0.025);
float negBand = step(abs(uv2.x - uv2.y), 0.025);
// c_init += mix(c_init, 1.0 - c_init, max(posBand, negBand));
c_init = mix(c_init, 1.0 - c_init, max(posBand, negBand));


  uv = rotateTilePattern(uv);
  uv = rotateTilePattern(uv);
  uv = rotateTilePattern(uv);
  uv = rotateTilePattern(uv + sin(t));

    if(c_init == vec3(1.)){

    c_init = mix(c_init, 1.-c_init, step(fract(sin(uv2.y -.6  / log(uv.x)) + sin(uv.y *( 5. * sin(t) ) ) * .1), .1 ));
    
    // ?? animation frame flicker!!!!
    // c_init = mix(c_init, 1.-c_init, step(fract(sin(uv.y -(tan(t / uv.x)) ) + sin(uv.x *( 10. * cos(t) ) ) * .2), .1 ));    
    // ?? adds fract spiral (sin looks more floral)
    c_init = mix(c_init, 1.-c_init, step(fract(sin(uv.y -(sin(t * 5.)) ) + sin(uv.x *( 10. * cos(t) ) ) * .2), .1 ));    
    // c_init = mix(c_init, 1.-c_init, step(fract(sin(uv.y -(tan(t)) ) + sin(uv.x *( 10. * cos(t) ) ) * .2), .1 ));    
    // ?? darker
    // c_init = mix(c_init, 1.-c_init, step(cnoise(uv * 500.), 4. * cos(t+ uv.x)));
  }

  
  // ??? black and white polka dots
  // vec3 c_out = vec3(c_init.r, c_init.g, c_init.b);
  // ??? minutemaid
  // vec3 c_out = vec3(c_init.r, c_init.g, c_init.b) * vec3(exp(E) / uv.x, uv.y, uv.x * log(uv.x / uv.y));
  // ??? LASER criss cross (use uv with the .5 offset)
  // vec3 c_out = vec3(c_init.r, c_init.g, c_init.b) * (vec3(uv.x / uv.y, sin(rate) * (uv.x / uv.y), .5) * .1);
  // ??? color spectrum
  vec3 cp1 = c_palette(sin(uv.y + uv.x * rate) + c_init.r, vec3(1., 0.5, 0.), vec3(0., 1., 0.), vec3(0., 0., 1.), vec3(1., 0., 0.)) * vec3(c_init.r, c_init.g, c_init.b);

  vec3 c_out = cp1;


  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}