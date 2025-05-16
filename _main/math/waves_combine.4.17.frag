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

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  //uv = fract(uv * 2.0) - 0.5;
  float rate = u_time * 1.0;
  float rate1 = u_time * 0.5;
  vec3 c1 = vec3(1.0);
  vec3 c_out = vec3(1.0);
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  vec2 gridUV = fract(uv * vec2(4.0,4.)); // Tile 10x10
  //float movingX = step(0.8, gridUV.x + sin(pow(u_time + gridUV.y * 3.0,gridUV.x)) * 0.2);
  //float movingY = step(0.8, gridUV.y + cos(u_time + gridUV.x * 2.0) * 0.2);
  float movingX = step(0.8, gridUV.x + sin(pow(u_time + gridUV.y * 3.0,gridUV.x)) * 0.2);
  float movingY = step(0.8, gridUV.y + exp(cos(u_time + gridUV.x * 2.0)) * 0.2);
  float squares = max(movingX, movingY);
  // step(0.3, p_2);

  vec3 c2 = c_palette(
    sin(movingX) + gridUV.x,
    vec3(0.0902, 0.149, 0.5098),vec3(0.149, 0.251, 0.5294),vec3(0.2235, 0.3922, 0.4706),vec3(0.8471, 0.8706, 0.8667)
  ); // blue
  vec3 c3 = c_palette(
    squares + gridUV.y - (sin(rate1)*0.25),
    vec3(1.0,1.0,1.0),vec3(0.7451, 0.7412, 0.7412),vec3(0.7608, 0.7569, 0.7569),vec3(0.0,0.10,0.20)
  );
  vec3 c3b = c_palette(
    uv.x,
    vec3(0.7529, 0.9412, 0.9176),vec3(0.5373, 0.9294, 0.851),vec3(0.2118, 0.8353, 0.9608),vec3(0.2314, 0.0196, 1.0)
  );
  vec3 cm23 = mix(c2, c3 + (sin(rate1)*0.5) * uv.x, squares);

  FragColor = vec4(cm23, 1.0);
}