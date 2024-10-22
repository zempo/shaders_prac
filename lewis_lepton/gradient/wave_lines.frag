#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.14159265359;

mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main(){
  vec2 uv = ((gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution);
  vec2 uv_2 = ((gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;
  /**
   float c_1 = 0.0;
  c_1 += sin(uv.x * 6.0 + sin(u_time + uv.y * 90.0 + cos(uv.x * 30.0 + (u_time / 0.5) * 2.0))) * 0.5;

  vec3 c_out = vec3(c_1 + uv.x + (sin(u_time / 2.0) / 5.0), c_1 + uv.x, c_1);
  gl_FragColor = vec4(c_out, 1.0); 
  */ 

  float c_1 = 0.0;
  float c_2 = 0.0;
  c_1 += sin(uv.x * 6.0 + sin(u_time + uv.y * 90.0 + cos(uv.x * 30.0 + (u_time / 0.5) * 2.0))) * 0.5;
  c_1 += cos(uv.x * 6.0 + cos(u_time + uv.y * 90.0 + sin(uv.x * 30.0 + (u_time / 0.5) * 2.0))) * 0.5;
  c_2 += sin(uv_2.x * 6.0 + sin(u_time + uv_2.y * 90.0 + cos(uv_2.x * 30.0 + (u_time / 0.5) * 2.0))) * 0.5;
  c_2 += cos(uv_2.x * 6.0 + cos(u_time + uv_2.y * 90.0 + sin(uv_2.x * 30.0 + (u_time / 0.5) * 2.0))) * 0.5;
  // c_1 += cos(uv.x * 6.0 + cos(u_time + uv.y * 90.0 + sin(uv.x * 30.0 + (u_time / 0.5) * 2.0))) * 0.5;
  vec3 c_1_clr = vec3(c_1 + uv.y * 0.5, c_1 + uv.x * 1.1, c_1 + uv.y);
  vec3 c_2_clr = vec3(c_2 + uv_2.x, c_2, 0.0);
  // uv_2 -= vec2(0.5);
  // uv_2 = rotate(PI * 1.5) * uv_2;
  // uv_2 += vec2(0.5);

  vec3 c_12 = mix(c_1_clr, c_2_clr, 0.75);

  vec3 blendedColor = c_1_clr + c_2_clr;

    // Ensure the result stays in valid color range [0,1]
  blendedColor = clamp(blendedColor, 0.0, 1.0);


  // vec3 c_out = vec3(c_1 + uv.y * 0.5, c_1 + uv.x * 1.1, c_1 + uv.y);
  // vec3 c_out = vec3(c_1_clr, c_2_clr, c_2 + uv.y);
  gl_FragColor = vec4(blendedColor, 1.0);

}