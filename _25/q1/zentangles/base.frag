#ifdef GL_ES
precision highp float;
#endif
// precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
  varying vec2 vUv;
 
const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
  
float wiggly(float cx, float cy, float amplitude, float frequency, float spread){

  float w = sin(cx * amplitude * frequency * PI) * cos(cy * amplitude * frequency * PI) * spread;

  return w;
}


void coswarp(inout vec3 trip, float warpsScale ){

  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (u_time * .25));
  
}


void uvRipple(inout vec2 uv, float intensity){

	vec2 p = uv -.5;


    float cLength=length(p);

     uv= uv +(p/cLength)*cos(cLength*15.0-u_time*.5)*intensity;

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
  
 //	Classic Perlin 2D Noise
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
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


  
void main() {
	vec2 uv = (gl_FragCoord.xy - u_resolution * .5) / u_resolution.yy + 0.5;
  
  float vTime = u_time;
 
  
  vec2 uv2 = uv;
   vec2 uv3 = uv;
	
  float t = (u_time * .2) + length(uv2-.5);
  
vec3 color = vec3 (1.);
  
   

  
uv = rotateTilePattern(uv);
 
  
  color = mix(color, 1.-color, step(length(uv-.1), .1));
  
  color = mix(color, 1.-color, step(uv.x, .1)-step(uv.x, .05));
  
  
    color = mix(color, 1.-color, step(uv.y, .1)-step(uv.y, .05));
  
  
   color = mix(color, 1.-color, step(uv2.x-.5 + uv2.y-.5, .1)- step(uv2.x-.5 + uv2.y-.5, .05));
  
  uv = rotateTilePattern(uv);
  uv = rotateTilePattern(uv);
  uv = rotateTilePattern(uv);
  uv = rotateTilePattern(uv + sin(t));
  
  if(color == vec3(1.)){
    color = mix(color, 1.-color, step(fract(sin(uv2.y -.6 ) + sin(uv.x *( 5. * sin(t) ) ) * .1), .1 ));
    
    
      color = mix(color, 1.-color, step(fract(sin(uv.y -(tan(t)) ) + sin(uv.x *( 10. * cos(t) ) ) * .2), .1 ));
    
     color = mix(color, 1.-color, step(cnoise(uv * 500.), 4. * cos(t+ uv.x)));
  }
	
    gl_FragColor = vec4(vec3(color.r, color.g, color.b), 1.0);
}