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
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 29.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}
// *** snoise (simplex)

// modified perlin noise, giving value in w and derivative in xyz
vec4 snoise(vec3 v) {
	  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
	  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
	
	// First corner
	  vec3 i = floor(v + dot(v, C.yyy) );
	  vec3 x0 = v - i + dot(i, C.xxx) ;
	
	// Other corners
	  vec3 g = step(x0.yzx, x0.xyz);
	  vec3 l = 1.0 - g;
	  vec3 i1 = min( g.xyz, l.zxy );
	  vec3 i2 = max( g.xyz, l.zxy );
	
	  // x0 = x0 - 0.0 + 0.0 * C.xxx;
	  // x1 = x0 - i1 + 1.0 * C.xxx;
	  // x2 = x0 - i2 + 2.0 * C.xxx;
	  // x3 = x0 - 1.0 + 3.0 * C.xxx;
	  vec3 x1 = x0 - i1 + C.xxx;
	  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
	  vec3 x3 = x0 - D.yyy; // -1.0+3.0*C.x = -0.5 = -D.y
	
	// Permutations
	  i = mod(i,289.0);
	  vec4 p = permute( permute( permute(
		     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
		   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
		   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
	
	// Gradients: 7x7 points over a square, mapped onto an octahedron.
	// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
	  float n_ = 0.142857142857; // 1.0/7.0
	  vec3 ns = n_ * D.wyz - D.xzx;
	
	  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,7*7)
	
	  vec4 x_ = floor(j * ns.z);
	  vec4 y_ = floor(j - 7.0 * x_ ); // mod(j,N)
	
	  vec4 x = x_ *ns.x + ns.yyyy;
	  vec4 y = y_ *ns.x + ns.yyyy;
	  vec4 h = 1.0 - abs(x) - abs(y);
	
	  vec4 b0 = vec4( x.xy, y.xy );
	  vec4 b1 = vec4( x.zw, y.zw );
	
	  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
	  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
	  vec4 s0 = floor(b0)*2.0 + 1.0;
	  vec4 s1 = floor(b1)*2.0 + 1.0;
	  vec4 sh = -step(h, vec4(0.0));
	
	  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
	  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
	
	  vec3 p0 = vec3(a0.xy,h.x);
	  vec3 p1 = vec3(a0.zw,h.y);
	  vec3 p2 = vec3(a1.xy,h.z);
	  vec3 p3 = vec3(a1.zw,h.w);
	
	//Normalise gradients
	  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
	  p0 *= norm.x;
	  p1 *= norm.y;
	  p2 *= norm.z;
	  p3 *= norm.w;
	
	// Mix final noise value
	  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
	  m = m * m;
	  float w = 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
		  
	// derivatives
	  vec3 dx = vec3(0.001, 0, 0);
	  vec4 mx = max(0.6 - vec4(dot(x0+dx,x0+dx), dot(x1+dx,x1+dx), dot(x2+dx,x2+dx), dot(x3+dx,x3+dx)), 0.0);
	  mx = mx * mx;
	  float wx = 42.0 * dot( mx*mx, vec4( dot(p0,x0+dx), dot(p1,x1+dx), dot(p2,x2+dx), dot(p3,x3+dx) ) );

	  vec3 dy = vec3(0, 0.001, 0);
	  vec4 my = max(0.6 - vec4(dot(x0+dy,x0+dy), dot(x1+dy,x1+dy), dot(x2+dy,x2+dy), dot(x3+dy,x3+dy)), 0.0);
	  my = my * my;
	  float wy = 42.0 * dot( my*my, vec4( dot(p0,x0+dy), dot(p1,x1+dy), dot(p2,x2+dy), dot(p3,x3+dy) ) );

	  vec3 dz = vec3(0, 0, 0.001);
	  vec4 mz = max(0.6 - vec4(dot(x0+dz,x0+dz), dot(x1+dz,x1+dz), dot(x2+dz,x2+dz), dot(x3+dz,x3+dz)), 0.0);
	  mz = mz * mz;
	  float wz = 42.0 * dot( mz*mz, vec4( dot(p0,x0+dz), dot(p1,x1+dz), dot(p2,x2+dz), dot(p3,x3+dz) ) );
		  
  // ?? baseline 3d bulbs
	// return vec4((wx-w)*1000.0, (wy-w)*1000.0, (wz-w)*1000.0, w);
  // ?? cartoony bulbs
	// return vec4((wx-w)*10.0, (wy-w)*10.0, (wz-w)*10.0, w);
  // ?? microscopic (plasticy fibers)
  // float w_tmp1 = 6. * 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
	// return vec4((wx-w)*100.0, (wy-w)*100.0, (wz-w)*100.0, w_tmp1);
  // ?? shifting dimensions (lowered cell_mult for resolution)
  // float cell_mult = 100.0;
  // float w_tmp1 = 42.0 * dot( m*m + (sin(u_time * .5) * m), vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
	// return vec4((wx-w)*cell_mult, (wy-w)*cell_mult, (wz-w)*cell_mult, w_tmp1);
  // ?? black and white
  // float cell_mult = 100.0;
  // float w_tmp1 = 42.0 * dot( m*m + (sin(u_time * .5) * m), vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );

	//   float wx_tmp = 42.0 * dot( mx*mx, vec4( dot(p0,x0+dx), dot(p1,x1+dx), dot(p2,x2+dx), dot(p3,x3+dx) ) );

	// return vec4((wx_tmp)*cell_mult, (wx_tmp)*cell_mult, (wx_tmp)*cell_mult, w);
  // ?? electron microscope fibers
  // float cell_mult = 10.0;
  // float w_tmp1 = 42.0 * dot( m*m + (sin(u_time * .5) * m), vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );

	//   float wx_tmp = 42.0 * dot( mx*mx, vec4( dot(p0,x0+dx), dot(p1,x1+dx), dot(p2,x2+dx), dot(p3,x3+dx) ) );

	// return vec4((wx * w)*cell_mult, (wy - w)*cell_mult, (wz / w)*cell_mult, w * 8.);
  // ?? electron microscope fibers
  float cell_mult = 10.0;
  float w_tmp1 = 42.0 * dot( m*m + (sin(u_time * .5) * m), vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );

	  float wx_tmp = 42.0 * dot( mx*mx, vec4( dot(p0,x0+dx), dot(p1,x1+dx), dot(p2,x2+dx), dot(p3,x3+dx) ) );

	return vec4((wx * w)*cell_mult, (wy - w)*cell_mult, (wz / w)*cell_mult, w * 8.);
}


const vec3 diffuse = vec3( .5, .75, 1. );
const vec3 eps = vec3( .001, 0., 0. );
const int iter = 100;

vec4 c( vec3 p ) {
  //  combined with scaled snoise by .5
  
  // *** radial falloff term (+ 1. prevents division by zero)
  // *+ vec4(-2.0*p.x, -2.0*p.y, 0.0, 1.0)/(p.x*p.x+p.y*p.y+1.0)


	vec4 v = snoise(p*0.5) + vec4(-2.0*p.x, -2.0*p.y, 0.0, 1.0)/(p.x*p.x+p.y*p.y+1.0);
	return vec4(v.xyz, abs(v.w) + 0.01);
}


void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

    float rate = u_time * 1.0;
  float rated = u_time * 2.0;
  float rateh = u_time * .50;
  float rateq = u_time * .25;

  float r = u_resolution.x / u_resolution.y;
  // vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2. - 1.;
  // vec2 uvM = u_mouse-.5;
  // uv.x *= r;
  // uvM.x *= r;

  vec2 uvM = (u_mouse.xy - (u_resolution.xy * 0.5)) / u_resolution.y * zoom;
uvM.x *= r; // Aspect ratio correction

vec3 o = vec3(0., 0., rate);  // Ray origin (animated along Z-axis)
vec3 s = vec3(uvM, 0.);       // Scene focus point (mouse-driven)
vec3 b = vec3(0., 0., 0.);    // Background color or unused placeholder
vec3 d = vec3(uv, 1.) / 32.;  // Ray direction (normalized step)
vec3 t = vec3(.5);            // Color accumulator or threshold
vec3 a;                       // Uninitialized (likely for temporary calculations)

vec3 light = o + vec3(0,0,2.5);

for(float i = 0.0; i < iter; i++){
		// vec3 v = b+s+o;
		vec3 v = b+o;
		vec4 hv = c(v);
		float h = hv.w;
		b += h * 6.0 * d;
		float d = v.z*0.7;
		float dist = dot(v-light, v-light);
		float mx = min(dist, 1.0);
		t += (pow(max(0.0,dot(normalize(reflect(light-v, normalize(hv.xyz))), normalize(b))), 34.0) + abs(dot(normalize(hv.xyz), light-v))*0.1 * (normalize(hv.xyz)+1.0)) * pow(h, -1.2) * 0.1 * (iter-i);
	}
	t = t / float(iter*iter);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  // init_easing for easing functions


  
  vec3 c_out = sqrt(t);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}