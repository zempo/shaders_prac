#version 460

/**
 Inspired by: 
 - https://glslsandbox.com/e#109604.0
 - https://glslsandbox.com/e#109612.0
**/ 



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

void main(){
  float zoom = 2.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
  float rate = u_time * 1.0;
  float rate2 = u_time * 0.15;

  for(int i = 0; i < 5; i++){
    float curr_i = float(i);
    uv += sin(uv.yx * vec2(1.6, 1.1) * (curr_i + 11.0) + rate * curr_i * vec2(3.4, 0.5) / 10.0) * 0.1; 
  }

  float p1 = (abs(sin(uv.y + rate * 0.0) + sin(uv.x + rate * 0.0))) * 0.5;
  vec3 c1 = vec3(0.3569, 0.7765, 0.8392);
  // vec3 c_out = (c1*p1);
  vec3 c2 = c_palette(
    p1,
    vec3(0.000, 0.333, 0.667),vec3(-0.052, 1.000, 1.000),vec3(1.088, -0.862, 0.138),vec3(0.448, -0.052, 0.778)
  );

  vec3 c3 = vec3(0.9098/rate, 0.898/rate2, 0.7216/rate2);
  vec3 c4 = vec3(0.898, 0.2627, 0.051);

  float f = 0.0;
  float g = 0.0;
  float h = 0.0;
  for(float i = 0.0; i < 40.0; i++){
    if(floor(41.0) < i){
      break;      
    }
    float s = sin(rate2 + i * PI / 2.0) * 0.8;
		float c = cos(rate2 + i * PI / 2.0) * 0.8;
		float d = abs(uv.x + c);
		float e = abs(uv.y + s);
		f += 0.001 / d;
		g += 0.001 / e;
		h += 0.00003 / (d * e);
  }

  vec3 c1c = vec3(f*c3+g*c4+vec3(h));

  vec3 cp1 = (p1*c1)+(c2*p1)+(c1c-0.2);
  vec3 cp2 = (p1*c1)+(c2*p1)+(c1c-0.2);
  vec3 cp3 = (p1*c1)+(c2*p1)+(c1c-0.2);
  vec3 cp4 = (p1*c1)+(c2*p1)+(c1c-0.2);
  vec3 cp5 = (p1*c1)+(c2*p1)+(c1c-0.2);
  vec3 cp6 = (p1*c1)+(c2*p1)+(c1c-0.2);

  vec3 a1[6] = vec3[6](
    cp1,cp2,cp3,cp4,cp5,cp6
  );
  int a1_idx = int(mod(u_time, 6.0)); // Modulo cycles between 0, 1, 2...etc over time
  vec3 a_out1 = a1[int(a1_idx)];

  vec3 c_out = a_out1; 
  // vec3(0.000, 0.333, 0.667),vec3(-0.052, 1.000, 1.000),vec3(1.088, -0.862, 0.138),vec3(0.448, -0.052, 0.778)
  // vec3(0.448, -0.052, 0.778), vec3(1.088, -0.862, 0.138), vec3(-0.052, 1.000, 1.000), vec3(0.000, 0.333, 0.667)
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}