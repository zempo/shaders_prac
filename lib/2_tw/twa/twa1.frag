#version 460

#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

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

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random2d(i, 0.0);
  float b = random2d(i + vec2(1.0, 0.0), 0.0);
  float c = random2d(i + vec2(0.0, 1.0), 0.0);
  float d = random2d(i + vec2(1.0, 1.0), 0.0);
  // Smooth Interpolation

  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f*f*(3.0-2.0*f);
  // u = smoothstep(0.,1.,f);

  // Mix 4 coorners percentages
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float ha( float n ) {return fract(sin(n)*713.5354);}


// Modulo 289 without no division complications
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

// Modulo 7 without no division
vec3 mod7(vec3 x) {
  return x - floor(x * (1.0 / 7.0)) * 7.0;
}

// Permutation polynomial: (34x^2 + x) mod 289
vec3 permute(vec3 x) {
  return mod289((27.0 * x + 1.0) * x);
}


vec2 cellular(vec3 P) {
#define K 0.142857142857 // 1/7
#define Ko 0.428571428571 // 1/2-K/2
#define K2 0.02065306 // 1/(7*7)
#define Kz 0.166666666667 // 1/6
#define Kzo 0.416666666667 // 1/2-1/6*2
#define jitter 1.0 

	vec3 Pi = mod289(floor(P));
 	vec3 Pf = fract(P) - 0.5;

	vec3 Pfx = Pf.x + vec3(1.0, 0.0, -1.0);
	vec3 Pfy = Pf.y + vec3(1.0, 0.0, -1.0);
	vec3 Pfz = Pf.z + vec3(1.0, 0.0, -1.0);

	vec3 p = permute(Pi.x + vec3(-1.0, 0.0, 1.0));
	vec3 p1 = permute(p + Pi.y - 1.0);
	vec3 p2 = permute(p + Pi.y);
	vec3 p3 = permute(p + Pi.y + 1.0);

	vec3 p11 = permute(p1 + Pi.z - 1.0);
	vec3 p12 = permute(p1 + Pi.z);
	vec3 p13 = permute(p1 + Pi.z + 1.0);

	vec3 p21 = permute(p2 + Pi.z - 1.0);
	vec3 p22 = permute(p2 + Pi.z);
	vec3 p23 = permute(p2 + Pi.z + 1.0);

	vec3 p31 = permute(p3 + Pi.z - 1.0);
	vec3 p32 = permute(p3 + Pi.z);
	vec3 p33 = permute(p3 + Pi.z + 1.0);

	vec3 ox11 = fract(p11*K) - Ko;
	vec3 oy11 = mod7(floor(p11*K))*K - Ko;
	vec3 oz11 = floor(p11*K2)*Kz - Kzo; 

	vec3 ox12 = fract(p12*K) - Ko;
	vec3 oy12 = mod7(floor(p12*K))*K - Ko;
	vec3 oz12 = floor(p12*K2)*Kz - Kzo;

	vec3 ox13 = fract(p13*K) - Ko;
	vec3 oy13 = mod7(floor(p13*K))*K - Ko;
	vec3 oz13 = floor(p13*K2)*Kz - Kzo;

	vec3 ox21 = fract(p21*K) - Ko;
	vec3 oy21 = mod7(floor(p21*K))*K - Ko;
	vec3 oz21 = floor(p21*K2)*Kz - Kzo;

	vec3 ox22 = fract(p22*K) - Ko;
	vec3 oy22 = mod7(floor(p22*K))*K - Ko;
	vec3 oz22 = floor(p22*K2)*Kz - Kzo;

	vec3 ox23 = fract(p23*K) - Ko;
	vec3 oy23 = mod7(floor(p23*K))*K - Ko;
	vec3 oz23 = floor(p23*K2)*Kz - Kzo;

	vec3 ox31 = fract(p31*K) - Ko;
	vec3 oy31 = mod7(floor(p31*K))*K - Ko;
	vec3 oz31 = floor(p31*K2)*Kz - Kzo;

	vec3 ox32 = fract(p32*K) - Ko;
	vec3 oy32 = mod7(floor(p32*K))*K - Ko;
	vec3 oz32 = floor(p32*K2)*Kz - Kzo;

	vec3 ox33 = fract(p33*K) - Ko;
	vec3 oy33 = mod7(floor(p33*K))*K - Ko;
	vec3 oz33 = floor(p33*K2)*Kz - Kzo;

	vec3 dx11 = Pfx + jitter*ox11;
	vec3 dy11 = Pfy.x + jitter*oy11;
	vec3 dz11 = Pfz.x + jitter*oz11;

	vec3 dx12 = Pfx + jitter*ox12;
	vec3 dy12 = Pfy.x + jitter*oy12;
	vec3 dz12 = Pfz.y + jitter*oz12;

	vec3 dx13 = Pfx + jitter*ox13;
	vec3 dy13 = Pfy.x + jitter*oy13;
	vec3 dz13 = Pfz.z + jitter*oz13;

	vec3 dx21 = Pfx + jitter*ox21;
	vec3 dy21 = Pfy.y + jitter*oy21;
	vec3 dz21 = Pfz.x + jitter*oz21;

	vec3 dx22 = Pfx + jitter*ox22;
	vec3 dy22 = Pfy.y + jitter*oy22;
	vec3 dz22 = Pfz.y + jitter*oz22;

	vec3 dx23 = Pfx + jitter*ox23;
	vec3 dy23 = Pfy.y + jitter*oy23;
	vec3 dz23 = Pfz.z + jitter*oz23;

	vec3 dx31 = Pfx + jitter*ox31;
	vec3 dy31 = Pfy.z + jitter*oy31;
	vec3 dz31 = Pfz.x + jitter*oz31;

	vec3 dx32 = Pfx + jitter*ox32;
	vec3 dy32 = Pfy.z + jitter*oy32;
	vec3 dz32 = Pfz.y + jitter*oz32;

	vec3 dx33 = Pfx + jitter*ox33;
	vec3 dy33 = Pfy.z + jitter*oy33;
	vec3 dz33 = Pfz.z + jitter*oz33;

	vec3 d11 = dx11 * dx11 + dy11 * dy11 + dz11 * dz11;
	vec3 d12 = dx12 * dx12 + dy12 * dy12 + dz12 * dz12;
	vec3 d13 = dx13 * dx13 + dy13 * dy13 + dz13 * dz13;
	vec3 d21 = dx21 * dx21 + dy21 * dy21 + dz21 * dz21;
	vec3 d22 = dx22 * dx22 + dy22 * dy22 + dz22 * dz22;
	vec3 d23 = dx23 * dx23 + dy23 * dy23 + dz23 * dz23;
	vec3 d31 = dx31 * dx31 + dy31 * dy31 + dz31 * dz31;
	vec3 d32 = dx32 * dx32 + dy32 * dy32 + dz32 * dz32;
	vec3 d33 = dx33 * dx33 + dy33 * dy33 + dz33 * dz33;


	vec3 d1a = min(d11, d12);
	d12 = max(d11, d12);
	d11 = min(d1a, d13); 
	d13 = max(d1a, d13);
	d12 = min(d12, d13);
	vec3 d2a = min(d21, d22);
	d22 = max(d21, d22);
	d21 = min(d2a, d23); 
	d23 = max(d2a, d23);
	d22 = min(d22, d23);
	vec3 d3a = min(d31, d32);
	d32 = max(d31, d32);
	d31 = min(d3a, d33); 
	d33 = max(d3a, d33);
	d32 = min(d32, d33); 
	vec3 da = min(d11, d21);
	d21 = max(d11, d21);
	d11 = min(da, d31); 
	d31 = max(da, d31); 
	d11.xy = (d11.x < d11.y) ? d11.xy : d11.yx;
	d11.xz = (d11.x < d11.z) ? d11.xz : d11.zx;
	d12 = min(d12, d21);
	d12 = min(d12, d22);
	d12 = min(d12, d31);
	d12 = min(d12, d32);
	d11.yz = min(d11.yz,d12.xy); 
	d11.y = min(d11.y,d12.z); 
	d11.y = min(d11.y,d11.z); 
	return sqrt(d11.xy); 

}
float no( in vec3 x )
{    
	vec3 p = floor(x);    
	vec3 f = fract(x); 
	float n = p.x + p.y*57.0 + p.z*800.0;
	float res = mix(mix(mix( ha(n+  0.0), ha(n+  1.0),f.x), mix( ha(n+ 57.0), ha(n+ 58.0),f.x),f.y),
			mix(mix( ha(n+800.0), ha(n+801.0),f.x), mix( ha(n+857.0), ha(n+858.0),f.x),f.y),f.z);
	return res;
}

float fb(vec3 p) {
	float v = 0.0;
	float w = 0.0;
	float a = 1.0;
	for(int i=0;i<5;i++)
	{
		v += a * (cellular(p).x * 0.5 + 0.5);
		w += a;
		p *= 3.0;
		a *= 0.7;
	}
	return smoothstep(0.1, 1.0, v / w);
}

float whacky(vec3 p) {
	float v = 0.1;
	float w = 0.0;
	float a = 1.0;
	for(int i=0;i<4;i++){
		float x = pow(cellular(p).x, 3.14);
		v += a * x ;
		w += a;
		p.xy *= 3.0;
		p.z *= 1.2;
		a *= 0.8;
	}
	return smoothstep(0.1, 1.0, pow(v / w *3.9, 4.0));		
}

vec3 mk_cp2 (vec2 pt, vec2 st, float rate) {
  float scale = (u_resolution.y / st.y);
  float ring = 5.0;
  float radius = u_resolution.x*st.x;
  float gap = scale*0.3;

  float d = length(pt) * 1.0;

	// Create the wiggle
	d += (sin(pt.y*2.0/scale+u_time)*sin(pt.x*2.0/scale+u_time*.5))*scale * 4.0;
	

	// Compute the distance to the closest ring
	float v = mod(d + radius/(ring*3.0), radius/ring);
	v = abs(v - radius/(ring*2.0));

  v = clamp(v-gap, 0.0, 3.0);

  d /= radius;

  float r_1 = fb(vec3(pt * 0.51, rate));
  float r_2 = whacky(vec3(pt * 0.0001, rate * 0.1));
  vec3 m = fract((d-1.0)*vec3(ring*-.5, -ring + r_1, ring*.25*r_2)*0.5);

  return m * v / 2.0;
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 uv1 = uv * 1.5;
  vec2 uv2 = uv * 1000.0;
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  float rate = u_time * .750;
  float rate2 = u_time * 1.0;
  
  float p1r = fb(vec3(uv1, rate)) * .3;
  float p1g = whacky(vec3(uv1, rate)) * 1.;
  float p1b = whacky(vec3(uv1, rate)) * 2.;
  vec3 p1p = c_palette(
    whacky(vec3(uv1, rate)),
    vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0314, 0.1451, 0.251)
  );
  vec3 c1 = vec3(p1r,p1g,p1b) + (p1p*0.1);
  vec3 c2 = mk_cp2(uv2, vec2(clamp((sin(rate2)*10.0),0.51,10.0),10.0), rate2);
  vec3 c_out = c2;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  // FragColor = vec4(c_out, 1.0);
  FragColor = vec4(c_out, 1.0); 
}

/**
  https://glslsandbox.com/e#109594.0 
 https://glslsandbox.com/e#109408.0
**/ 