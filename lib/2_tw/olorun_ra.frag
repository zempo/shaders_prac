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

float random2d(vec2 coord, float seed){
  const float a = 12.9898;
  const float b = 78.233;
  const float c = 43758.543123;

  return fract(sin(dot(coord.xy, vec2(a, b)) + seed) * c);
}

vec3 mk_cp3(vec2 pt, float len, float rate) {
  vec3 c = vec3(0.0);
  for(float i = 0.0; i < len; i++){
    float t = 0.4 * TAU * i / 30.0 * rate;
    float x = tan(5.0*t);
    float y = sin(4.0*t);
    vec2 uv_out = 0.4 * vec2(x,y);
    float r = fract(x);
    float g = 0.6 - r;
    c += 0.01 / (length(pt-uv_out)) * vec3(r,g,0.9);
  }
  return c;
}

vec3 mk_cp4(vec2 pt, float len, float rate) {
  float factor = 0.01;
  float c = cos(1000.5 * TAU);
  float s = sin(1000.5 * TAU);

  for(float i = 0.0; i < len; i++){
    float d = (i+3.) / len;
    float x = pt.x + rate;
    float y = pt.y + sin(pt.x * d * 7.0 - rate) / d*factor + cos(pt.x * d - rate) / d*factor;

    pt.x = x * c - y * s;
		pt.y = x * s + y * c;
  }
  float col = length(pt)*0.25; 
  // abs(sin(rate*0.05))
  // vec3 c_in = vec3(cos(col)*1.,cos(col*150.0-(10*sin(rate)))*.1,cos(col*100.0+(5*sin(rate)))*2.0);
  vec3 c_in = vec3(cos(col)*1.,cos(col*5.0)*.1,1.0);
  vec3 c_m = vec3(0.1922, 0.3333, 0.7686);
  return c_in + (c_m*sin(rate));
}

vec2 random_cp5( vec2 seed ) {
	float t = sin(seed.x+seed.y*1e3);
	return vec2(fract(t*1e5), fract(t*1e6));
}
float cvoronoi( vec2 x ) {
    vec2 p = floor( x );
    vec2  f = fract( x );

    float res = 1.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
      vec2 b = vec2( i, j );
	    vec2 o = random_cp5( p + b );
      vec2 r = vec2( b ) - f + o;
      float d = dot( r,r );
	    // res = min(res,(abs(fract(d*6.0-time*0.5 +o.x*8.)-.5)*8.+d*.8)/sqrt(d));
	    res = min(res,(abs(fract(d*6.0-u_time*0.5 +o.x*8.)-.5)*8.+d*.8)/sqrt(d));
    }	
    return res;
}
vec3 mk_cp5(vec2 pt, float rate) {
  vec3 c_pal = c_palette(
    pt.x * .150 + sin(0.16*rate),
    vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)
  );
  vec3 c_pal2 = c_palette(
    .2+cvoronoi(pt*3.*(sin(.05)+1.2))*.5,
    vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)
  );
  // return c_pal/c_pal2;
  return c_pal*2.5*.2+cvoronoi(pt*3.*(sin(.15*rate)+1.2))*.5;
}

void main(){
  float zoom = 3.0;
  vec2 uv1 = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 uv2 = uv1 * 1.0;
  vec2 uv3 = uv1 * 0.35;
  vec2 uv4 = uv1 * 5.0;
  vec2 uv5 = uv1 * 1.0;
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  uv1 = fract(uv1 * 2.0) - 0.5;
  float rate1 = u_time * 0.75;
  float rate2 = u_time;
  float rate3 = u_time * 0.01;
  float rate4 = u_time * 1.0;
  float rate5 = u_time * 1.0;

  //* Ripples -- if ripple index, run ripple effect
  float duration = 3.;
  float delay = 0.0; 
  float total_time = duration + delay;
  float time_in_phase = mod(rate1, total_time);

  // if (time_in_phase <= delay) {
    // Delay phase: No ripple effect
//     uv3 = uv3;
// } else {
// }
    // Effect phase: Ripple effect
    float effect_time = time_in_phase - delay; // Time relative to the start of the effect
    float len = fract(length(uv2) * .25 ); 
    vec2 ripple = uv3 + uv3 / len * 0.03 * cos(len * 100.0 - effect_time * 4.0);
    float delta = (sin(effect_time * (2.0 * PI / duration)) + 1.0) / 2.0;
    uv3 = mix(ripple, uv3, delta);
    uv4 += mix(ripple, uv1, delta);
    uv5 += mix(ripple, uv3, delta);
  
  // *Patterns
  float l1 = length(uv1);
  float l2 = length(uv2);
  vec2 rm = vec2(sin(cos(rate1) * l1), cos(sin(rate1) * 0.5) * dot(uv1*uv1, uv1));
  vec2 rm2 = vec2(sin(cos(rate2) * l2), cos(sin(rate2) * 0.5) * dot(uv2, uv2*uv2));
  uv1 = vec2( uv1.x*rm.x - uv1.y*rm.y, uv1.x*rm.y - uv1.y*rm.x * dot(uv1,uv1));
  uv2 = vec2( uv2.x*rm2.x - uv2.y*rm2.y, uv2.x*rm2.y - uv2.y*rm2.x * dot(uv2,uv2));
  float p1 = abs(l1-2.0)+(cos(2.*(atan(uv1.x,uv1.y))))*0.13;
  float p2 = abs(l2-2.0)+(cos(.5*(atan(uv2.x,uv2.y))))*0.13;

  // *Colors
  vec3 c1 = vec3(abs(1.9-p1),1./p1,p1+0.2);
  vec3 c2 = vec3(p2,abs(.4-p2),1.-p2 * (uv2));
  vec3 c3 = mk_cp3(uv3, 20.0, rate3);
  vec3 c4 = mk_cp4(uv4, 40.0, rate4);
  vec3 c5 = mk_cp5(uv5, rate5);

  // vec3 c_out = mix(c1, c2, 0.73);
  vec3 c_out = c5;

  //*Alphas
  float a1 = 1.4;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}