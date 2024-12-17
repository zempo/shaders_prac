#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
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

void main(){
  float zoom = 10.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  float rate = u_time * 4.0;

  float factor = uv.x * 1.0;
  float c = cos(uv.y * TAU);
	float s = sin(uv.y * TAU);

	for ( int i = 0; i <= 4; i++ ){
		float d = float(i+3) / float(4);
		float x = uv.x;
		float y = uv.y + sin(uv.x * d * 5.50 + rate)/d*factor + cos(uv.x * d + rate)/d*factor;
		
		uv.x = x * c - y * s;
		uv.y = x * s + y * c;
	}

  float p1 = length(uv)*0.25;
  vec3 c_out = vec3(cos(p1), cos(p1*2.0), cos(p1*4.0));
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/* 
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}