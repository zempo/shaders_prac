#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform vec2 u_mouse;
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

// ***************************************************
// float t,tt,b,bb,g,a,la;vec2 z,v,e=vec2(.00035,-.00035);vec3 pp,op,cp,po,no,al,ld;
// vec4 np; 
const vec3 e = vec3(0.00035, -0.00035, 0.0);
mat2 r2(float r){return mat2(cos(r),sin(r),-sin(r),cos(r));}
float bo(vec3 p,vec3 r){p=abs(p)-r;return max(max(p.x,p.y),p.z);}

float tt=mod(u_time,62.82)+8.;
float bb=1.-ceil(sin(tt*.4));

float b;
float g;
vec3 op;
vec3 cp;
vec3 pp;
vec3 po;
vec3 no;
vec3 al;
// vec3 ld;
vec4 np; 
vec2 h;
vec2 t;
vec2 z;

vec2 fb(vec3 p,float i,float s) {
  vec2 t=vec2(length(p.xz)-2.-clamp(sin(p.y*5.),-.2,.2)*.2,5);
  t.x=abs(t.x)-.2;

  pp = p;
  // pp.y+=1.-float(i)*2.;
  pp.y+=1.-float(i)*2.;
  // *** straight pipes
  float a=max(abs(bo(pp,vec3(.65,2.,200.)))-.2,abs(pp.y)-.5);
  t.x=min(t.x,mix(a,length(pp.xy-sin(p.z*.5))-.5,b));
  // float a=max(abs(bo(pp,vec3(.65,2.,200.)))-.2,abs(pp.y)-.5);
  // t.x=min(t.x,mix(a,length(pp.xy-sin(p.z*.5))-.5,b));
  // ?? base shape: abs(bo(pp,vec3(.65,2.,200.)))-.2 
  // ?? pipe height abs(pp.y)-1. >>
  // ********* 

  pp.x=mix(abs(pp.x)-0.7,pp.y*.5-.8,b);//lampposts
  pp.z=mod(pp.z,3.)-1.5;

  // *** organic pipes
  pp-=mix(vec3(0,1.,.0),vec3(0.,-1.3,0.)+sin(p.z*.5),b);        
  t.x=min(t.x,bo(pp,vec3(.1,2.,.1))); 
  // *****8
  pp.y-=2.;     //lamps 

  float zoom_ind = 5.;
  float zoom_org = 5.5 - 5.;

  float la =length(pp)-.1;
    g+=0.1/(0.1+la*la*40.);
    t.x=min(t.x,la);
    t.x/=s;    
    t.x=max(t.x,-(length(op.xy-vec2(-2.*b,6.-float(i)*.1))-5.));
    t.x=max(t.x,(abs(op.y)-5.+float(i))); 
    // !! black plumes
    h=vec2(length(p.xz)-1.+(pp.y*.1/float(i*2.+1.)),3); //black
    h.x/=s;
    h.x=max(h.x,-(length(op.xy-vec2(0,6.1+3.*b-float(i)*.1))-5.));    
    h.x=max(h.x,(abs(op.y)-5.5-5.*b+float(i)));
    t=t.x<h.x?t:h;
    if(i<2.){
        h=vec2(abs(length(p.xz)-1.2)-.1,6);
        h.x/=s;    
        h.x=max(h.x,-(length(op.xy-vec2(-1.*b,6.2-float(i)*.1))-5.));    
        h.x=max(h.x,(abs(op.y)-6.+float(i)));        
        t=t.x<h.x?t:h;
    }   
  return t; 
}

vec2 mp( vec3 p,float ga) {
  p.yz *= r2(mix(-.785,-.6154,bb));
  p.xz *= r2(mix(0.,.785,bb));
  op = p;
  b = clamp(cos(op.z*.1+tt*.4),-.25,.25)*2.+.5;
  p.z = mod(p.z-tt,10.) - 5.0;

  vec2 local_best = vec2(1000.0);
  np = vec4(p,1.0); // !!! path
  for (int i = 0; i < 5; i++) {
    np.xz = abs(np.xz) - 2.1 + sin(np.y * .5) * .5 * b;
    np.xz *= r2(-.785);
    np *= 2.1;
    // np.xz = abs(np.xz) - 2.1 + sin(np.y * .5) * .5 * b;
    // np.xz *= r2(-.785);
    // np *= 2.1;
    vec2 local_h = fb(np.xyz, float(i), np.w);
    local_h.x *= 0.85;
    local_best = (local_best.x < local_h.x) ? local_best : local_h;
  }

  vec2 ground = vec2(p.y + 2.0 + 3.0 * cos(p.x * .35), 6.0);
  ground.x = max(ground.x, p.y);
  ground.x *= 0.5;
  local_best = (local_best.x < ground.x) ? local_best : ground;

  cp = p;
  return local_best;
}

//varying vec2 vUv;

vec2 tr( vec3 ro, vec3 rd, int it) {
  vec2 trace_res = vec2(-3.0);
  for (int i = 0; i < it; i++) {
    vec2 hvec = mp(ro + rd * trace_res.x, 1.0);
    if (hvec.x < 0.0001 || trace_res.x > 17.0) break;
    trace_res.x += hvec.x;
    trace_res.y = hvec.y;
  }
  if (trace_res.x > 17.0) trace_res.y = 0.0;
  return trace_res;
}

#define a(d) clamp(mp(po+no*d,0.).x/d,0.,1.)
#define s(d) smoothstep(0.,1.,mp(po+ld*d,0.).x/d)
void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

  vec3 ro=vec3(uv*8.,-8.),
  rd=vec3(0.,0.,1.),co,fo;
  co=fo=vec3(.13,.1,.12)-length(uv)*.12;

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions
  float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  vec3 ld = normalize(vec3(-.5,.5,-.3));
  vec2 z = tr(ro, rd, 128);
  float tDist = z.x;

  if (z.y > 0.0) {
    po = ro + rd * tDist;

    vec2 d0 = mp(po + e.xyy, 0.0);
    vec2 d1 = mp(po + e.yyx, 0.0);
    vec2 d2 = mp(po + e.yxy, 0.0);
    vec2 d3 = mp(po + e.xxx, 0.0);
    no = normalize(e.xyy * d0.x + e.yyx * d1.x + e.yxy * d2.x + e.xxx * d3.x);
    al=mix(vec3(.0,.1,.3),vec3(0.4,0.3,0.1),b);
    if(z.y<5.) al=vec3(0);
    if(z.y>5.) al=vec3(1),no-=0.2*ceil(abs(cos((cp)*5.2))-.05),no=normalize(no);    
    float dif=max(0.,dot(no,ld)),
    fr=pow(1.+dot(no,rd),4.),
    sp=pow(max(dot(reflect(-ld,no),-rd),0.),40.);
    co=mix(sp+al*(a(0.05)+.2)*(dif+s(.5)),fo,min(fr,.5));
    co=mix(fo,co,exp(-.001*tDist*tDist*tDist));
  }
  co=mix(co,co.xzy,length(uv*.7));  
  // vec3 c_out = pow(co+g*.2*mix(vec3(1.,.5,0.),vec3(1.),sin(tDist*5.)*.5-.2),vec3(.45));
  vec3 c_out = pow(co+g*.2*mix(vec3(1.5,clamp(.5-b,-.5,.5),.3*sin(rated)),vec3(1.),sin(tDist*5.)*.5-.2),vec3(.5+clamp(b,-.3,.15)));
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
} 